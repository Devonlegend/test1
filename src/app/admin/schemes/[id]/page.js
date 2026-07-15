"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, BookOpen, GraduationCap, Briefcase,
  Wrench, Banknote, AlertCircle, CheckCircle2,
  Loader2, XCircle, Edit2, Save, X,
  Users, Calendar, DollarSign, Shield,
  Building2, CalendarRange,
} from "lucide-react";
import styles from "./page.module.css";
import {
  getScheme, publishScheme, closeScheme, updateScheme, reopenScheme,
  getProviders, getCycles,
} from "@/services";

// ── CATEGORY CONFIG ───────────────────────────────────────────────────────────
const categoryConfig = {
  scholarship: { label: "Scholarship", color: "#15803d", bg: "#f0fdf4", icon: GraduationCap },
  empowerment: { label: "Empowerment", color: "#b45309", bg: "#fffbeb", icon: Briefcase     },
  grant:       { label: "Grant",       color: "#7e22ce", bg: "#faf5ff", icon: Banknote      },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatCurrency(amount) {
  if (!amount) return "—";
  return `₦${Number(amount).toLocaleString()}`;
}

// ── INFO ROW ──────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, color }) {
  return (
    <div className={styles.infoRow}>
      <div className={styles.infoIcon}>
        <Icon size={14} strokeWidth={1.8} />
      </div>
      <div className={styles.infoContent}>
        <span className={styles.infoLabel}>{label}</span>
        <span className={styles.infoValue} style={color ? { color } : {}}>
          {value || "—"}
        </span>
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function SchemeDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [scheme,       setScheme]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [editing,      setEditing]      = useState(false);
  const [form,         setForm]         = useState({});
  const [saving,       setSaving]       = useState(false);
  const [saveError,    setSaveError]    = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError,   setActionError]   = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [providers,    setProviders]    = useState([]);
  const [cycles,       setCycles]       = useState([]);
  const [loadingMeta,  setLoadingMeta]  = useState(true);

  // ── FETCH ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [schemeRes, provRes, cycRes] = await Promise.allSettled([
          getScheme(params.id),
          getProviders(),
          getCycles(),
        ]);
        if (cancelled) return;
        if (schemeRes.status === "fulfilled") {
          setScheme(schemeRes.value.data);
          setForm(schemeRes.value.data);
        } else {
          setError("Failed to load scheme.");
        }
        if (provRes.status === "fulfilled") {
          const data = Array.isArray(provRes.value.data?.results) ? provRes.value.data.results :
                       Array.isArray(provRes.value.data) ? provRes.value.data : [];
          setProviders(data);
        }
        if (cycRes.status === "fulfilled") {
          const data = Array.isArray(cycRes.value.data?.results) ? cycRes.value.data.results :
                       Array.isArray(cycRes.value.data) ? cycRes.value.data : [];
          setCycles(data);
        }
      } catch {
        if (!cancelled) setError("Failed to load scheme.");
      } finally {
        if (!cancelled) { setLoading(false); setLoadingMeta(false); }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [params.id]);

  // ── EDIT ──────────────────────────────────────────────────────────────────
  function startEdit() {
    setForm({ ...scheme });
    setEditing(true);
    setSaveError("");
  }

  function cancelEdit() {
    setEditing(false);
    setSaveError("");
  }

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    try {
      const ec = scheme.eligibility_criteria || {};
      const body = {
        name:                   form.name,
        description:            form.description,
        academic_year:          form.academic_year,
        award_amount:           parseFloat(form.award_amount),
        total_slots:            parseInt(form.total_slots),
        application_open_date:  form.application_open_date,
        application_close_date: form.application_close_date,
        stacking_policy:        form.stacking_policy,
        provider_id:            form.provider_id || form.provider?.id,
        cycle_id:               form.cycle_id || form.cycle?.id,
        min_cgpa:               form._min_cgpa ?? ec.min_cgpa,
        allowed_levels:         form._allowed_levels ?? (ec.allowed_levels || []).join(","),
        min_age:                form._min_age ?? ec.min_age,
        max_age:                form._max_age ?? ec.max_age,
        allowed_trades:         form._allowed_trades ?? (ec.allowed_trades || []).join(","),
        ward_restriction:       form._ward_restriction ?? (ec.ward_restriction || []).join(","),
        max_prior_awards:       form._max_prior_awards ?? ec.max_prior_awards,
      };
      const res = await updateScheme(params.id, body);
      setScheme(res.data);
      setEditing(false);
    } catch (err) {
      setSaveError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  // ── PUBLISH ───────────────────────────────────────────────────────────────
  async function handlePublish() {
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      await publishScheme(params.id);
      setScheme((s) => ({ ...s, is_published: true }));
      setActionSuccess("Scheme published successfully.");
    } catch (err) {
      setActionError(err?.response?.data?.error || "Failed to publish scheme.");
    } finally {
      setActionLoading(false);
    }
  }

  // ── REOPEN ────────────────────────────────────────────────────────────────
async function handleReopen() {
  setActionLoading(true);
  setActionError("");
  setActionSuccess("");
  try {
    await reopenScheme(params.id);
    setScheme((s) => ({ ...s, is_active: true }));
    setActionSuccess("Scheme reopened successfully.");
  } catch (err) {
    setActionError(err?.response?.data?.error || "Failed to reopen scheme.");
  } finally {
    setActionLoading(false);
  }
}

  // ── CLOSE ─────────────────────────────────────────────────────────────────
  async function handleClose() {
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      await closeScheme(params.id);
      setScheme((s) => ({ ...s, is_active: false }));
      setActionSuccess("Scheme closed successfully.");
    } catch (err) {
      setActionError(err?.response?.data?.error || "Failed to close scheme.");
    } finally {
      setActionLoading(false);
    }
  }

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.centerState}>
        <div className={styles.spinner} />
      </div>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (error || !scheme) {
    return (
      <div className={styles.centerState}>
        <AlertCircle size={28} color="#f87171" strokeWidth={1.5} />
        <p style={{ color: "#ef4444", fontWeight: 600 }}>{error || "Scheme not found."}</p>
        <button className={styles.backBtn} onClick={() => router.push("/admin/schemes")}>
          <ArrowLeft size={14} strokeWidth={2} /> Back to Schemes
        </button>
      </div>
    );
  }

  const catKey   = (scheme.award_type || "scholarship").toLowerCase();
  const category = categoryConfig[catKey] || categoryConfig.scholarship;
  const Icon     = category.icon;
  const isOpen   = scheme.is_active && scheme.is_published;
  const isDraft  = !scheme.is_published;
  const isClosed = !scheme.is_active;

  return (
    <div className={styles.page}>

      {/* BACK */}
      <button className={styles.backBtn} onClick={() => router.push("/admin/schemes")}>
        <ArrowLeft size={14} strokeWidth={2} /> Back to Schemes
      </button>

      {/* PAGE HEADER */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.schemeIcon} style={{ background: category.bg, border: `1.5px solid ${category.color}30` }}>
            <Icon size={22} color={category.color} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className={styles.title}>{scheme.name}</h1>
            <p className={styles.sub}>{scheme.academic_year} · {category.label}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={`${styles.statusPill} ${isOpen ? styles.pillOpen : isDraft ? styles.pillDraft : styles.pillClosed}`}>
            {isOpen ? "Open" : isDraft ? "Draft" : "Closed"}
          </span>
          {!editing && (
          <button className={styles.editBtn} onClick={startEdit}>
              <Edit2 size={13} strokeWidth={2} /> Edit
            </button>
          )}
        </div>
      </div>
      

      {/* ACTION BANNERS */}
      {actionSuccess && (
        <div className={styles.successBanner}>
          <CheckCircle2 size={14} color="#15803d" strokeWidth={2} />
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className={styles.errorBanner}>
          <AlertCircle size={14} color="#dc2626" strokeWidth={2} />
          {actionError}
        </div>
      )}

      {/* SAVE ERROR */}
      {saveError && (
        <div className={styles.errorBanner}>
          <AlertCircle size={14} color="#dc2626" strokeWidth={2} />
          {saveError}
        </div>
      )}

      {/* BODY */}
      <div className={styles.body}>

        {/* LEFT — scheme details */}
        <div className={styles.leftCol}>

          {/* Details card */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>Scheme Details</h2>
              {editing && (
                <div className={styles.editActions}>
                  <button className={styles.cancelEditBtn} onClick={cancelEdit} disabled={saving}>
                    <X size={13} strokeWidth={2} /> Cancel
                  </button>
                  <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving
                      ? <><Loader2 size={13} strokeWidth={2} className={styles.spin} /> Saving...</>
                      : <><Save size={13} strokeWidth={2} /> Save Changes</>
                    }
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div className={styles.editForm}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Scheme Name</label>
                  <input className={styles.input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Description</label>
                  <textarea className={styles.textarea} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className={styles.twoCol}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Provider</label>
                    <select className={styles.input} value={form.provider?.id || form.provider_id || ""}
                      onChange={(e) => setForm((f) => ({ ...f, provider_id: e.target.value }))}>
                      <option value="">— Select —</option>
                      {providers.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Cycle</label>
                    <select className={styles.input} value={form.cycle?.id || form.cycle_id || ""}
                      onChange={(e) => setForm((f) => ({ ...f, cycle_id: e.target.value }))}>
                      <option value="">— Select —</option>
                      {cycles.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.start_year}/{c.end_year}){c.is_active ? " — Active" : ""}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.twoCol}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Academic Year</label>
                    <input className={styles.input} value={form.academic_year} onChange={(e) => setForm((f) => ({ ...f, academic_year: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Award Amount (₦)</label>
                    <input type="number" className={styles.input} value={form.award_amount} onChange={(e) => setForm((f) => ({ ...f, award_amount: e.target.value }))} />
                  </div>
                </div>
                <div className={styles.twoCol}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Total Slots</label>
                    <input type="number" className={styles.input} value={form.total_slots} onChange={(e) => setForm((f) => ({ ...f, total_slots: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Stacking Policy</label>
                    <select className={styles.input} value={form.stacking_policy} onChange={(e) => setForm((f) => ({ ...f, stacking_policy: e.target.value }))}>
                      <option value="exclusive">Exclusive</option>
                      <option value="major_only">Major Only</option>
                      <option value="open">Open</option>
                    </select>
                  </div>
                </div>
                <div className={styles.twoCol}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Open Date</label>
                    <input type="date" className={styles.input} value={form.application_open_date?.slice(0,10) || ""} onChange={(e) => setForm((f) => ({ ...f, application_open_date: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Close Date</label>
                    <input type="date" className={styles.input} value={form.application_close_date?.slice(0,10) || ""} onChange={(e) => setForm((f) => ({ ...f, application_close_date: e.target.value }))} />
                  </div>
                </div>
                {/* Eligibility criteria — read from scheme.eligibility_criteria */}
                {scheme.award_type === "scholarship" && (
                  <>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Min CGPA</label>
                      <input type="number" step="0.01" className={styles.input}
                        placeholder="e.g. 2.20"
                        value={form._min_cgpa ?? scheme.eligibility_criteria?.min_cgpa ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, _min_cgpa: e.target.value }))} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Allowed Levels</label>
                      <input className={styles.input}
                        placeholder="e.g. 100, 200, 300 (comma-separated)"
                        value={form._allowed_levels ?? (scheme.eligibility_criteria?.allowed_levels || []).join(", ")}
                        onChange={(e) => setForm((f) => ({ ...f, _allowed_levels: e.target.value }))} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Ward Restriction</label>
                      <input className={styles.input}
                        placeholder="comma-separated ward names (leave empty for all)"
                        value={form._ward_restriction ?? (scheme.eligibility_criteria?.ward_restriction || []).join(", ")}
                        onChange={(e) => setForm((f) => ({ ...f, _ward_restriction: e.target.value }))} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Max Prior Awards</label>
                      <input type="number" className={styles.input}
                        placeholder="e.g. 1"
                        value={form._max_prior_awards ?? scheme.eligibility_criteria?.max_prior_awards ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, _max_prior_awards: e.target.value }))} />
                    </div>
                  </>
                )}
                {(scheme.award_type === "empowerment" || scheme.award_type === "grant") && (
                  <>
                    <div className={styles.twoCol}>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Min Age</label>
                        <input type="number" className={styles.input}
                          value={form._min_age ?? scheme.eligibility_criteria?.min_age ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, _min_age: e.target.value }))} />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Max Age</label>
                        <input type="number" className={styles.input}
                          value={form._max_age ?? scheme.eligibility_criteria?.max_age ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, _max_age: e.target.value }))} />
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Ward Restriction</label>
                      <input className={styles.input}
                        placeholder="comma-separated ward names (leave empty for all)"
                        value={form._ward_restriction ?? (scheme.eligibility_criteria?.ward_restriction || []).join(", ")}
                        onChange={(e) => setForm((f) => ({ ...f, _ward_restriction: e.target.value }))} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Max Prior Awards</label>
                      <input type="number" className={styles.input}
                        placeholder="e.g. 1"
                        value={form._max_prior_awards ?? scheme.eligibility_criteria?.max_prior_awards ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, _max_prior_awards: e.target.value }))} />
                    </div>
                  </>
                )}
                {scheme.award_type === "empowerment" && (
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Allowed Trades</label>
                    <input className={styles.input}
                      placeholder="e.g. Welding, Tailoring, ICT"
                      value={form._allowed_trades ?? (scheme.eligibility_criteria?.allowed_trades || []).join(", ")}
                      onChange={(e) => setForm((f) => ({ ...f, _allowed_trades: e.target.value }))} />
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.infoGrid}>
                <InfoRow icon={BookOpen}     label="Description"      value={scheme.description} />
                <InfoRow icon={Building2}    label="Provider"         value={scheme.provider?.name || "—"} />
                <InfoRow icon={CalendarRange} label="Cycle"           value={scheme.cycle?.name ? `${scheme.cycle.name} (${scheme.cycle.start_year}/${scheme.cycle.end_year})` : "—"} />
                <InfoRow icon={Calendar}     label="Academic Year"    value={scheme.academic_year} />
                <InfoRow icon={DollarSign}   label="Award Amount"     value={formatCurrency(scheme.award_amount)} />
                <InfoRow icon={Users}        label="Total Slots"      value={`${scheme.remaining_slots ?? scheme.total_slots ?? "—"} remaining of ${scheme.total_slots ?? "—"}`} />
                <InfoRow icon={Calendar}     label="Opens"            value={formatDate(scheme.application_open_date)} />
                <InfoRow icon={Calendar}     label="Closes"           value={formatDate(scheme.application_close_date)} />
                <InfoRow icon={Shield}       label="Stacking Policy"  value={
                  scheme.stacking_policy === "exclusive" ? "Exclusive" :
                  scheme.stacking_policy === "major_only" ? "Major Only" :
                  "Open"
                } />
                <InfoRow icon={CheckCircle2} label="Eligibility"      value={
                  scheme.eligibility_criteria && Object.keys(scheme.eligibility_criteria).length > 0
                    ? JSON.stringify(scheme.eligibility_criteria, null, 1)
                    : "None set"
                } />
              </div>
            )}
          </div>

        </div>

        {/* RIGHT — actions */}
        <div className={styles.rightCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Scheme Actions</h2>
            <p className={styles.cardSub}>Manage the status of this scheme.</p>

            <div className={styles.statusDisplay}>
              <span className={styles.statusLabel}>Current Status</span>
              <span className={`${styles.statusPill} ${isOpen ? styles.pillOpen : isDraft ? styles.pillDraft : styles.pillClosed}`}>
                {isOpen ? "Open" : isDraft ? "Draft" : "Closed"}
              </span>
            </div>

            <div className={styles.actionBtns}>
              {isDraft && (
                <button className={styles.publishBtn} onClick={handlePublish} disabled={actionLoading}>
                  {actionLoading
                    ? <><Loader2 size={14} strokeWidth={2} className={styles.spin} /> Publishing...</>
                    : <><CheckCircle2 size={14} strokeWidth={2} /> Publish Scheme</>
                  }
                </button>
              )}
              {isOpen && (
                <button className={styles.closeSchemeBtn} onClick={handleClose} disabled={actionLoading}>
                  {actionLoading
                    ? <><Loader2 size={14} strokeWidth={2} className={styles.spin} /> Closing...</>
                    : <><XCircle size={14} strokeWidth={2} /> Close Scheme</>
                  }
                </button>
              )}
              {isClosed && (
                <button className={styles.reopenBtn} onClick={handleReopen} disabled={actionLoading}>
                  {actionLoading
                    ? <><Loader2 size={14} strokeWidth={2} className={styles.spin} /> Reopening...</>
                    : <><CheckCircle2 size={14} strokeWidth={2} /> Reopen Scheme</>
                  }
                </button>
              )}

            <div className={styles.actionWarning}>
              <AlertCircle size={12} color="#f59e0b" strokeWidth={2} />
              <span>
                {isDraft
                  ? "Publishing makes this scheme visible to students and opens applications."
                  : isOpen
                  ? "Closing this scheme will stop accepting new applications immediately."
                  : "Reopening this scheme will allow students to submit new applications."
                }
              </span>
            </div>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}