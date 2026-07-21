import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, AlertCircle, CheckCircle2, Send,
  GraduationCap, Briefcase, Banknote, ShieldAlert, Loader2,
} from "lucide-react";
import styles from "./page.module.css";
import { getApplicationsByScheme, publishSchemeApprovals } from "@/services";

// â”€â”€ STATUS MAPPING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const statusConfig = {
  submitted:         { label: "Pending",  color: "#f59e0b", bg: "#fffbeb" },
  eligibility_check: { label: "Pending",  color: "#f59e0b", bg: "#fffbeb" },
  document_review:   { label: "Pending",  color: "#f59e0b", bg: "#fffbeb" },
  shortlisted:       { label: "Pending",  color: "#f59e0b", bg: "#fffbeb" },
  draft:             { label: "Pending",  color: "#f59e0b", bg: "#fffbeb" },
  double_dip_flag:   { label: "Flagged",  color: "#ef4444", bg: "#fef2f2" },
  approved:          { label: "Approved", color: "#15803d", bg: "#f0fdf4" },
  rejected:          { label: "Rejected", color: "#64748b", bg: "#f8fafc" },
  withdrawn:         { label: "Rejected", color: "#64748b", bg: "#f8fafc" },
};

const categoryConfig = {
  scholarship: { label: "Scholarship", color: "#15803d", bg: "#f0fdf4", icon: GraduationCap },
  empowerment: { label: "Empowerment", color: "#b45309", bg: "#fffbeb", icon: Briefcase },
  grant:       { label: "Grant",       color: "#7e22ce", bg: "#faf5ff", icon: Banknote },
};

const REVIEWABLE = ["submitted", "eligibility_check", "document_review", "shortlisted", "double_dip_flag"];
const POLL_INTERVAL = 30_000;

function formatDate(dateStr) {
  if (!dateStr) return "â€”";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// â”€â”€ PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AdminSchemeReviewPage() {
  const router = useRouter();
  const params = useParams();
  const schemeId = params.schemeId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [view, setView] = useState("pending");

  // â”€â”€ FETCH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const load = useCallback(async (silent) => {
    try {
      const res = await getApplicationsByScheme(schemeId);
      if (silent !== true) setLoading(false);
      setData(res.data);
      setError(null);
    } catch {
      if (silent !== true) {
        setError("Failed to load this scheme's applications.");
        setLoading(false);
      }
    }
  }, [schemeId]);

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    function onFocus() { load(true); }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  // â”€â”€ PUBLISH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handlePublish() {
    setConfirmPublish(false);
    setPublishing(true);
    setPublishMsg(null);
    try {
      const res = await publishSchemeApprovals(schemeId);
      setPublishMsg({
        type: "success",
        text: `${res.data.sent} approval email${res.data.sent === 1 ? "" : "s"} sent for ${res.data.scheme}.`,
      });
      await load(true);
    } catch (err) {
      setPublishMsg({
        type: "error",
        text: err?.response?.data?.error || "Failed to publish. Please try again.",
      });
    } finally {
      setPublishing(false);
    }
  }

  // â”€â”€ LOADING / ERROR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (loading) {
    return (
      <div className={styles.centerState}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.centerState}>
        <AlertCircle size={28} color="#f87171" strokeWidth={1.5} />
        <p style={{ color: "#ef4444", fontWeight: 600 }}>{error || "Scheme not found."}</p>
        <button className={styles.backBtn} onClick={() => router.push("/admin/applications")}>
          <ArrowLeft size={14} strokeWidth={2} /> Back to Schemes
        </button>
      </div>
    );
  }

  const scheme = data.scheme;
  const catKey = (scheme.award_type || "scholarship").toLowerCase();
  const cat = categoryConfig[catKey] || categoryConfig.scholarship;
  const Icon = cat.icon;

  const allApps = data.applications || [];
  const pendingApps = allApps.filter((a) => REVIEWABLE.includes(a.status));
  const shown = view === "pending" ? pendingApps : allApps;

  const allReviewed = data.pending_review === 0;
  const canPublish = data.unpublished > 0 && !publishing;

  return (
    <div className={styles.page}>

      {/* BACK */}
      <button className={styles.backBtn} onClick={() => router.push("/admin/applications")}>
        <ArrowLeft size={14} strokeWidth={2} /> Back to Schemes
      </button>

      {/* PAGE HEADER */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.schemeIcon} style={{ background: cat.bg, border: `1.5px solid ${cat.color}30` }}>
            <Icon size={22} color={cat.color} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className={styles.title}>{scheme.name}</h1>
            <span className={styles.catChip} style={{ color: cat.color, background: cat.bg }}>{cat.label}</span>
          </div>
        </div>

        {/* LIVE COUNT */}
        <div className={styles.liveCount}>
          <span
            className={styles.liveCountValue}
            style={{ color: allReviewed ? "#15803d" : "#f59e0b" }}
          >
            {data.pending_review}
          </span>
          <span className={styles.liveCountLabel}>
            {allReviewed ? "all reviewed" : "to review"}
          </span>
        </div>
      </div>

      {/* PUBLISH BAR */}
      <div className={styles.publishBar}>
        <div className={styles.publishInfo}>
          {data.unpublished > 0 ? (
            <>
              <Send size={15} color="#15803d" strokeWidth={2} />
              <span>
                <strong>{data.unpublished}</strong> approved application{data.unpublished === 1 ? "" : "s"} waiting to be emailed.
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 size={15} color="#94a3b8" strokeWidth={2} />
              <span>No approval emails pending.</span>
            </>
          )}
        </div>

        <button
          className={styles.publishBtn}
          onClick={() => setConfirmPublish(true)}
          disabled={!canPublish}
          title={!data.unpublished ? "Nothing to publish" : !allReviewed ? "Some applications still need review" : ""}
        >
          {publishing
            ? <Loader2 size={15} strokeWidth={2} className={styles.spin} />
            : <Send size={15} strokeWidth={2} />}
          Publish Approvals
        </button>
      </div>

      {/* PUBLISH MESSAGE */}
      {publishMsg && (
        <div className={publishMsg.type === "success" ? styles.successBanner : styles.errorBanner}>
          {publishMsg.type === "success"
            ? <CheckCircle2 size={14} strokeWidth={2} />
            : <AlertCircle size={14} strokeWidth={2} />}
          {publishMsg.text}
        </div>
      )}

      {/* MAIN CARD */}
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${view === "pending" ? styles.tabActive : ""}`}
              onClick={() => setView("pending")}
            >
              To Review
              {pendingApps.length > 0 && (
                <span className={styles.tabBadge} style={{ background: "#f59e0b", color: "white" }}>
                  {pendingApps.length}
                </span>
              )}
            </button>
            <button
              className={`${styles.tab} ${view === "all" ? styles.tabActive : ""}`}
              onClick={() => setView("all")}
            >
              All
              <span className={styles.tabBadge} style={{ background: "#e2e8f0", color: "#64748b" }}>
                {allApps.length}
              </span>
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className={styles.tableWrap}>
          <div className={`${styles.tableRow} ${styles.tableHeader}`}>
            <span>Student</span>
            <span>Submitted</span>
            <span>Status</span>
            <span></span>
          </div>

          {shown.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrap} style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
                <CheckCircle2 size={24} color="#15803d" strokeWidth={1.8} />
              </div>
              <p className={styles.emptyTitle} style={{ color: "#15803d" }}>All caught up</p>
              <p className={styles.emptySub}>
                {view === "pending"
                  ? "No applications left to review for this scheme."
                  : "No applications for this scheme yet."}
              </p>
            </div>
          )}

          {shown.map((app) => {
            const status = statusConfig[app.status] || statusConfig.submitted;
            const isConflict = app.status === "double_dip_flag";
            const fullName = app.student?.full_name || "Unknown";
            const initials = fullName.split(" ").map((n) => n[0] || "").slice(0, 2).join("").toUpperCase();

            return (
              <div
                key={app.id}
                className={`${styles.tableRow} ${styles.tableRowData} ${isConflict ? styles.tableRowFlagged : ""}`}
              >
                <div className={styles.tdStudent}>
                  <div className={styles.studentAvatar}>{initials}</div>
                  <div className={styles.studentInfo}>
                    <span className={styles.studentName}>{fullName}</span>
                    <span className={styles.studentMeta}>{app.student?.ward || "â€”"}</span>
                  </div>
                </div>

                <span className={styles.tdDate}>{formatDate(app.submission_date)}</span>

                <div className={styles.tdStatus}>
                  <span className={styles.statusBadge} style={{ color: status.color, background: status.bg }}>
                    {status.label}
                  </span>
                  {isConflict && (
                    <span className={styles.conflictChip}>
                      <ShieldAlert size={10} strokeWidth={2} /> Conflict
                    </span>
                  )}
                </div>

                <button
                  className={styles.viewBtn}
                  onClick={() => router.push(`/admin/applications/${app.id}`)}
                >
                  Review <ArrowLeft size={11} strokeWidth={2} style={{ transform: "rotate(180deg)" }} />
                </button>
              </div>
            );
          })}
        </div>

        <div className={styles.tableFooter}>
          Showing {shown.length} of {allApps.length} applications
        </div>
      </div>

      {/* CONFIRM PUBLISH MODAL */}
      {confirmPublish && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Publish Approval Emails?</h3>
            <p className={styles.modalText}>
              This will send approval emails to <strong>{data.unpublished}</strong> applicant
              {data.unpublished === 1 ? "" : "s"} for <strong>{scheme.name}</strong>.
              {!allReviewed && (
                <span style={{ color: "#f59e0b", display: "block", marginTop: 8 }}>
                  Note: {data.pending_review} application{data.pending_review === 1 ? "" : "s"} still need review â€” they will not be emailed until approved.
                </span>
              )}
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setConfirmPublish(false)} disabled={publishing}>
                Cancel
              </button>
              <button className={styles.modalConfirm} onClick={handlePublish} disabled={publishing}>
                {publishing ? <Loader2 size={14} strokeWidth={2} className={styles.spin} /> : null}
                Yes, Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
