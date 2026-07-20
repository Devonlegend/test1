"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardList, Search,
  ArrowRight, AlertCircle, CheckCircle2,
  ShieldAlert, LayoutGrid, List,
  GraduationCap, Briefcase, Banknote,
} from "lucide-react";
import styles from "./page.module.css";
import { getApplications, getSchemeOverview } from "@/services";

// ── STATUS MAPPING ────────────────────────────────────────────────────────────
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

// ── CATEGORY CONFIG ───────────────────────────────────────────────────────────
const categoryConfig = {
  scholarship: { label: "Scholarship", color: "#15803d", bg: "#f0fdf4", icon: GraduationCap },
  empowerment: { label: "Empowerment", color: "#b45309", bg: "#fffbeb", icon: Briefcase },
  grant:       { label: "Grant",       color: "#7e22ce", bg: "#faf5ff", icon: Banknote },
};

const POLL_INTERVAL = 30_000;

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── SKELETON ROW ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className={styles.tableRow}>
      <div className={styles.skeletonCell} style={{ width: "20%" }} />
      <div className={styles.skeletonCell} style={{ width: "28%" }} />
      <div className={styles.skeletonCell} style={{ width: "12%" }} />
      <div className={styles.skeletonCell} style={{ width: "10%" }} />
      <div className={styles.skeletonCell} style={{ width: "8%"  }} />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={styles.schemeCard}>
      <div className={styles.cardHeaderSkeleton}>
        <div className={styles.skeletonCircle} />
        <div className={styles.skeletonLines}>
          <div className={styles.skeletonCell} style={{ width: "60%", height: 16 }} />
          <div className={styles.skeletonCell} style={{ width: "40%", height: 12 }} />
        </div>
      </div>
      <div className={styles.cardBodySkeleton}>
        <div className={styles.skeletonCell} style={{ width: "50%", height: 40 }} />
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function AdminApplicationsPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const initialView = searchParams.get("view") === "all" ? "all" : "scheme";

  // Flat list state (for "All" view)
  const [applications, setApplications] = useState([]);
  // Scheme overview state (for "By Scheme" view)
  const [schemes, setSchemes] = useState([]);

  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [view,      setView]      = useState(initialView); // "scheme" | "all"
  const [tab,       setTab]       = useState("all");        // within the flat view
  const [search,    setSearch]    = useState("");

  // ── FETCH (scheme overview, with 30s polling + focus refresh) ─────────────
  const fetchSchemes = useCallback(async (silent) => {
    try {
      const res = await getSchemeOverview();
      setSchemes(res.data || []);
      if (silent !== true) setLoading(false);
      setError(null);
    } catch {
      if (silent !== true) {
        setError("Failed to load schemes. Please try again.");
        setLoading(false);
      }
    }
  }, []);

  const fetchAll = useCallback(async (silent) => {
    try {
      const res = await getApplications(1, { page_size: 9999 });
      const data = Array.isArray(res.data?.results) ? res.data.results : [];
      setApplications(data);
      if (silent !== true) setLoading(false);
      setError(null);
    } catch {
      if (silent !== true) {
        setError("Failed to load applications. Please try again.");
        setLoading(false);
      }
    }
  }, []);

  // Initial load — whichever view is active
  useEffect(() => {
    if (view === "scheme") fetchSchemes();
    else fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // Polling + focus refresh for the scheme view (live counts)
  useEffect(() => {
    if (view !== "scheme") return;
    const id = setInterval(() => fetchSchemes(true), POLL_INTERVAL);
    const onFocus = () => fetchSchemes(true);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [view, fetchSchemes]);

  // ── DERIVED COUNTS (flat view) ────────────────────────────────────────────
  const counts = {
    total:    applications.length,
    pending:  applications.filter((a) =>
      ["submitted", "eligibility_check", "document_review", "shortlisted", "draft"].includes(a.status)
    ).length,
    flagged:  applications.filter((a) => a.status === "double_dip_flag").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => ["rejected", "withdrawn"].includes(a.status)).length,
  };

  const filtered = applications.filter((app) => {
    const tabMatch =
      tab === "all"     ? true :
      tab === "pending" ? ["submitted", "eligibility_check", "document_review", "shortlisted", "draft"].includes(app.status) :
      tab === "flagged" ? app.status === "double_dip_flag" : true;

    const studentName = (app.student?.full_name || "").toLowerCase();
    const schemeName  = (app.scheme?.name || "").toLowerCase();
    const searchMatch = search.trim() === "" ? true :
      studentName.includes(search.toLowerCase()) ||
      schemeName.includes(search.toLowerCase());

    return tabMatch && searchMatch;
  });

  // ── SCHEME VIEW TOTALS ────────────────────────────────────────────────────
  const schemeTotals = {
    schemes:      schemes.length,
    pending:      schemes.reduce((s, d) => s + d.pending_review, 0),
    unpublished:  schemes.reduce((s, d) => s + d.unpublished, 0),
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>

      {/* PAGE HEADER */}
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <ClipboardList size={20} color="#15803d" strokeWidth={1.8} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
            <h1 className={styles.title}>Applications</h1>
            <p className={styles.sub}>Review and manage all programme applications.</p>
          </div>
        </div>

        {/* VIEW TOGGLE */}
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${view === "scheme" ? styles.viewBtnActive : ""}`}
            onClick={() => { setView("scheme"); setLoading(true); }}
          >
            <LayoutGrid size={14} strokeWidth={2} /> By Scheme
          </button>
          <button
            className={`${styles.viewBtn} ${view === "all" ? styles.viewBtnActive : ""}`}
            onClick={() => { setView("all"); setLoading(true); }}
          >
            <List size={14} strokeWidth={2} /> All Applications
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && !loading && (
        <div className={styles.emptyState}>
          <AlertCircle size={28} color="#f87171" strokeWidth={1.5} />
          <p style={{ color: "#ef4444", fontWeight: 600 }}>{error}</p>
          <button
            className={styles.retryBtn}
            onClick={() => { setError(null); setLoading(true); (view === "scheme" ? fetchSchemes : fetchAll)(); }}
          >
            Try again
          </button>
        </div>
      )}

      {/* ════════ BY SCHEME VIEW ════════ */}
      {view === "scheme" && !error && (
        <>
          {/* SUMMARY STRIP */}
          <div className={styles.summaryStrip}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue} style={{ color: "#0f172a" }}>
                {loading ? "—" : schemeTotals.schemes}
              </span>
              <span className={styles.summaryLabel}>Schemes</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue} style={{ color: "#f59e0b" }}>
                {loading ? "—" : schemeTotals.pending}
              </span>
              <span className={styles.summaryLabel}>Pending Review</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue} style={{ color: "#15803d" }}>
                {loading ? "—" : schemeTotals.unpublished}
              </span>
              <span className={styles.summaryLabel}>Unpublished</span>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className={styles.cardGrid}>
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* EMPTY */}
          {!loading && schemes.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrap} style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
                <CheckCircle2 size={24} color="#15803d" strokeWidth={1.8} />
              </div>
              <p className={styles.emptyTitle}>No schemes yet</p>
              <p className={styles.emptySub}>Applications will appear here once schemes are created.</p>
            </div>
          )}

          {/* SCHEME CARDS */}
          {!loading && schemes.length > 0 && (
            <div className={styles.cardGrid}>
              {schemes.map((entry) => {
                const s = entry.scheme;
                const cat = categoryConfig[s.award_type] || categoryConfig.scholarship;
                const Icon = cat.icon;
                const hasPending = entry.pending_review > 0;

                return (
                  <button
                    key={s.id}
                    className={`${styles.schemeCard} ${hasPending ? styles.schemeCardActive : ""}`}
                    onClick={() => router.push(`/admin/applications/scheme/${s.id}`)}
                  >
                    <div className={styles.cardHeader}>
                      <div
                        className={styles.cardIcon}
                        style={{ background: cat.bg, border: `1.5px solid ${cat.color}30` }}
                      >
                        <Icon size={18} color={cat.color} strokeWidth={1.8} />
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={styles.cardName}>{s.name}</span>
                        <span className={styles.cardChip} style={{ color: cat.color, background: cat.bg }}>
                          {cat.label}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.cardStat}>
                        <span
                          className={styles.cardStatValue}
                          style={{ color: hasPending ? "#f59e0b" : "#15803d" }}
                        >
                          {entry.pending_review}
                        </span>
                        <span className={styles.cardStatLabel}>to review</span>
                      </div>
                      {entry.unpublished > 0 && (
                        <div className={styles.cardStat}>
                          <span className={styles.cardStatValue} style={{ color: "#15803d" }}>
                            {entry.unpublished}
                          </span>
                          <span className={styles.cardStatLabel}>to publish</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.cardSlots}>
                        {s.remaining_slots} / {s.total_slots} slots remaining
                      </span>
                      <ArrowRight size={14} strokeWidth={2} className={styles.cardArrow} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ════════ ALL APPLICATIONS VIEW ════════ */}
      {view === "all" && !error && (
        <>
          {/* SUMMARY STRIP */}
          <div className={styles.summaryStrip}>
            {[
              { label: "Total",    value: counts.total,    key: "all"     },
              { label: "Pending",  value: counts.pending,  key: "pending", color: "#f59e0b" },
              { label: "Flagged",  value: counts.flagged,  key: "flagged", color: "#ef4444" },
              { label: "Approved", value: counts.approved, key: null,      color: "#15803d" },
              { label: "Rejected", value: counts.rejected, key: null,      color: "#64748b" },
            ].map((s) => (
              <button
                key={s.label}
                className={`${styles.summaryItem} ${tab === s.key ? styles.summaryItemActive : ""}`}
                onClick={() => s.key && setTab(s.key)}
                style={{ cursor: s.key ? "pointer" : "default" }}
              >
                <span className={styles.summaryValue} style={{ color: s.color || "#0f172a" }}>
                  {loading ? "—" : s.value}
                </span>
                <span className={styles.summaryLabel}>{s.label}</span>
              </button>
            ))}
          </div>

          {/* MAIN CARD */}
          <div className={styles.card}>

            {/* TABS + TOOLBAR */}
            <div className={styles.cardTop}>
              <div className={styles.tabs}>
                {[
                  { key: "all",     label: "All" },
                  { key: "pending", label: "Pending" },
                  { key: "flagged", label: "Flagged" },
                ].map((t) => (
                  <button
                    key={t.key}
                    className={`${styles.tab} ${tab === t.key ? styles.tabActive : ""}`}
                    onClick={() => setTab(t.key)}
                  >
                    {t.label}
                    {t.key === "flagged" && counts.flagged > 0 && (
                      <span className={styles.tabBadge}>{counts.flagged}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className={styles.toolbar}>
                <div className={styles.searchWrap}>
                  <Search size={14} className={styles.searchIcon} />
                  <input
                    className={styles.searchInput}
                    placeholder="Search by student or scheme..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className={styles.tableWrap}>
              <div className={`${styles.tableRow} ${styles.tableHeader}`}>
                <span>Student</span>
                <span>Scheme</span>
                <span>Submitted</span>
                <span>Status</span>
                <span></span>
              </div>

              {loading && [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}

              {!loading && tab === "flagged" && filtered.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconWrap} style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
                    <CheckCircle2 size={24} color="#15803d" strokeWidth={1.8} />
                  </div>
                  <p className={styles.emptyTitle} style={{ color: "#15803d" }}>Flagged queue is clear</p>
                  <p className={styles.emptySub}>No conflict or false declaration flags at this time.</p>
                </div>
              )}

              {!loading && tab === "pending" && filtered.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconWrap} style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
                    <CheckCircle2 size={24} color="#15803d" strokeWidth={1.8} />
                  </div>
                  <p className={styles.emptyTitle} style={{ color: "#15803d" }}>All caught up</p>
                  <p className={styles.emptySub}>No pending applications waiting for review.</p>
                </div>
              )}

              {!loading && filtered.length === 0 && tab !== "flagged" && tab !== "pending" && (
                <div className={styles.emptyState}>
                  <ClipboardList size={28} color="#cbd5e1" strokeWidth={1.5} />
                  <p className={styles.emptyTitle}>No applications found</p>
                  <p className={styles.emptySub}>
                    {search ? "Try a different search term." : "No applications this cycle yet."}
                  </p>
                </div>
              )}

              {!loading && filtered.map((app) => {
                const status     = statusConfig[app.status] || statusConfig.submitted;
                const catKey     = (app.scheme?.award_type || "").toLowerCase();
                const category   = categoryConfig[catKey] || categoryConfig.scholarship;
                const isConflict = app.status === "double_dip_flag";
                const fullName   = app.student?.full_name || "Unknown";
                const initials   = fullName.split(" ").map((n) => n[0] || "").slice(0, 2).join("").toUpperCase();

                return (
                  <div
                    key={app.id}
                    className={`${styles.tableRow} ${styles.tableRowData} ${isConflict ? styles.tableRowFlagged : ""}`}
                  >
                    <div className={styles.tdStudent}>
                      <div className={styles.studentAvatar}>{initials}</div>
                      <div className={styles.studentInfo}>
                        <span className={styles.studentName}>{fullName}</span>
                        <span className={styles.studentMeta}>{app.student?.ward || "—"}</span>
                      </div>
                    </div>

                    <div className={styles.tdScheme}>
                      <span className={styles.schemeName}>{app.scheme?.name || "—"}</span>
                      <span className={styles.categoryChip} style={{ color: category.color, background: category.bg }}>
                        {category.label}
                      </span>
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
                      Review <ArrowRight size={11} strokeWidth={2} />
                    </button>
                  </div>
                );
              })}
            </div>

            {!loading && (
              <div className={styles.tableFooter}>
                Showing {filtered.length} of {applications.length} applications
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
