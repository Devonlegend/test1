import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, BookOpen, GraduationCap, Briefcase,
  Wrench, Banknote, AlertCircle, CheckCircle2,
  Loader2, Plus, Building2, CalendarRange,
} from "lucide-react";
import styles from "./page.module.css";
import { createScheme, getCycles, getProviders } from "@/services";

const categoryConfig = {
  scholarship: { label: "Scholarship", color: "#15803d", bg: "#f0fdf4", icon: GraduationCap },
  empowerment: { label: "Empowerment", color: "#b45309", bg: "#fffbeb", icon: Briefcase     },
  grant:       { label: "Grant",       color: "#7e22ce", bg: "#faf5ff", icon: Banknote      },
};

const LEVEL_OPTIONS = ["100", "200", "300", "400", "500", "600", "Postgraduate"];

export default function NewSchemePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name:                   "",
    award_type:             "scholarship",
    description:            "",
    academic_year:          "2026/2027",
    award_amount:           "",
    total_slots:            "",
    application_open_date:  "",
    application_close_date: "",
    stacking_policy:        "major_only",
    provider_id:            "",
    cycle_id:               "",
  });

  const [eligibility, setEligibility] = useState({
    min_cgpa:         "",
    allowed_levels:   [],
    min_age:          "",
    max_age:          "",
    allowed_trades:   "",
    ward_restriction: "",
    max_prior_awards: "",
  });

  const [providers, setProviders] = useState([]);
  const [cycles,    setCycles]    = useState([]);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [apiError,  setApiError]  = useState("");
  const [success,   setSuccess]   = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [provRes, cycRes] = await Promise.allSettled([
          getProviders(),
          getCycles(),
        ]);
        if (provRes.status === "fulfilled") {
          const data = Array.isArray(provRes.value.data?.results) ? provRes.value.data.results :
                       Array.isArray(provRes.value.data) ? provRes.value.data : [];
          setProviders(data);
        }
        if (cycRes.status === "fulfilled") {
          const data = Array.isArray(cycRes.value.data?.results) ? cycRes.value.data.results :
                       Array.isArray(cycRes.value.data) ? cycRes.value.data : [];
          setCycles(data);
          const active = data.find((c) => c.is_active);
          if (active) setForm((f) => ({ ...f, cycle_id: active.id }));
        }
      } catch {} finally {
        setLoadingMeta(false);
      }
    }
    loadMeta();
  }, []);

  const category = categoryConfig[form.award_type] || categoryConfig.scholarship;
  const CatIcon  = category.icon;

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
    setApiError("");
  }

  function setElig(key, value) {
    setEligibility((e) => ({ ...e, [key]: value }));
  }

  function toggleLevel(level) {
    setEligibility((e) => ({
      ...e,
      allowed_levels: e.allowed_levels.includes(level)
        ? e.allowed_levels.filter((l) => l !== level)
        : [...e.allowed_levels, level],
    }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim())               e.name = "Scheme name is required.";
    if (!form.description.trim())        e.description = "Description is required.";
    if (!form.award_amount)              e.award_amount = "Award amount is required.";
    if (!form.total_slots)               e.total_slots = "Total slots is required.";
    if (!form.application_open_date)     e.application_open_date = "Open date is required.";
    if (!form.application_close_date)    e.application_close_date = "Close date is required.";
    if (form.application_open_date && form.application_close_date &&
        form.application_close_date <= form.application_open_date)
      e.application_close_date = "Close date must be after open date.";
    if (!form.provider_id)               e.provider_id = "Provider is required.";
    if (!form.cycle_id)                  e.cycle_id = "Cycle is required.";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    setApiError("");

    try {
      const body = {
        name:                   form.name,
        award_type:             form.award_type,
        description:            form.description,
        academic_year:          form.academic_year,
        award_amount:           parseFloat(form.award_amount),
        total_slots:            parseInt(form.total_slots),
        remaining_slots:        parseInt(form.total_slots),
        stacking_policy:        form.stacking_policy,
        application_open_date:  form.application_open_date,
        application_close_date: form.application_close_date,
        is_published:           false,
        is_active:              true,
        provider_id:            form.provider_id,
        cycle_id:               form.cycle_id,
        min_cgpa:               eligibility.min_cgpa,
        allowed_levels:         eligibility.allowed_levels.join(","),
        min_age:                eligibility.min_age,
        max_age:                eligibility.max_age,
        allowed_trades:         eligibility.allowed_trades,
        ward_restriction:       eligibility.ward_restriction,
        max_prior_awards:       eligibility.max_prior_awards,
      };

      const res = await createScheme(body);
      setSuccess(true);
      setTimeout(() => router.push("/admin/schemes"), 1200);
    } catch (err) {
      setApiError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to create scheme. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const isScholarship = form.award_type === "scholarship";
  const isEmpowerment = form.award_type === "empowerment";
  const isGrant       = form.award_type === "grant";

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => router.push("/admin/schemes")}>
        <ArrowLeft size={14} strokeWidth={2} /> Back to Schemes
      </button>

      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon} style={{ background: category.bg, border: `1.5px solid ${category.color}30` }}>
            <CatIcon size={22} color={category.color} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className={styles.title}>{form.name.trim() || "New Scheme"}</h1>
            <p className={styles.sub}>{form.academic_year} Â· {category.label}</p>
          </div>
        </div>
      </div>

      {success && (
        <div className={styles.successBanner}>
          <CheckCircle2 size={16} color="#15803d" strokeWidth={2} />
          Scheme created successfully. Redirecting...
        </div>
      )}

      {apiError && (
        <div className={styles.errorBanner}>
          <AlertCircle size={14} color="#dc2626" strokeWidth={2} />
          {apiError}
        </div>
      )}

      <div className={styles.body}>

        {/* LEFT COLUMN */}
        <div className={styles.leftCol}>

          {/* Basic Information */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Basic Information</h2>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Scheme Name {errors.name && <span className={styles.fieldError}>{errors.name}</span>}</label>
              <input className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                placeholder="e.g. 2026/2027 University Scholarship Award"
                value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Category</label>
              <div className={styles.categoryGrid}>
                {Object.entries(categoryConfig).map(([key, cat]) => {
                  const Icon = cat.icon;
                  return (
                    <button key={key} type="button"
                      className={`${styles.categoryOption} ${form.award_type === key ? styles.categoryOptionActive : ""}`}
                      style={form.award_type === key ? { borderColor: cat.color, background: cat.bg } : {}}
                      onClick={() => set("award_type", key)}>
                      <Icon size={16} color={form.award_type === key ? cat.color : "#94a3b8"} strokeWidth={1.8} />
                      <span style={{ color: form.award_type === key ? cat.color : "#374151" }}>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Description {errors.description && <span className={styles.fieldError}>{errors.description}</span>}</label>
              <textarea className={`${styles.textarea} ${errors.description ? styles.inputError : ""}`} rows={4}
                placeholder="Describe the purpose and scope of this scheme..."
                value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
          </div>

          {/* Provider & Cycle */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Provider & Cycle</h2>
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>
                  <Building2 size={12} strokeWidth={2} style={{ marginRight: 4, verticalAlign: -1 }} />
                  Provider {errors.provider_id && <span className={styles.fieldError}>{errors.provider_id}</span>}
                </label>
                {loadingMeta ? (
                  <div className={styles.selectSkeleton} />
                ) : (
                  <select className={`${styles.input} ${errors.provider_id ? styles.inputError : ""}`}
                    value={form.provider_id} onChange={(e) => set("provider_id", e.target.value)}>
                    <option value="">â€” Select Provider â€”</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>
                  <CalendarRange size={12} strokeWidth={2} style={{ marginRight: 4, verticalAlign: -1 }} />
                  Cycle {errors.cycle_id && <span className={styles.fieldError}>{errors.cycle_id}</span>}
                </label>
                {loadingMeta ? (
                  <div className={styles.selectSkeleton} />
                ) : (
                  <select className={`${styles.input} ${errors.cycle_id ? styles.inputError : ""}`}
                    value={form.cycle_id} onChange={(e) => set("cycle_id", e.target.value)}>
                    <option value="">â€” Select Cycle â€”</option>
                    {cycles.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.start_year}/{c.end_year}){c.is_active ? " â€” Active" : ""}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Application Period */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Application Period</h2>
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Open Date {errors.application_open_date && <span className={styles.fieldError}>{errors.application_open_date}</span>}</label>
                <input type="date" className={`${styles.input} ${errors.application_open_date ? styles.inputError : ""}`}
                  value={form.application_open_date} onChange={(e) => set("application_open_date", e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Close Date {errors.application_close_date && <span className={styles.fieldError}>{errors.application_close_date}</span>}</label>
                <input type="date" className={`${styles.input} ${errors.application_close_date ? styles.inputError : ""}`}
                  value={form.application_close_date} onChange={(e) => set("application_close_date", e.target.value)} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Academic Year</label>
              <input className={styles.input} placeholder="e.g. 2026/2027"
                value={form.academic_year} onChange={(e) => set("academic_year", e.target.value)} />
            </div>
          </div>

          {/* Eligibility Criteria â€” award-type-dependent */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Eligibility Criteria</h2>
            <p className={styles.cardSub}>Set the conditions students must meet to qualify.</p>

            {isScholarship && (
              <>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Minimum CGPA</label>
                  <input type="number" step="0.01" className={styles.input}
                    placeholder="e.g. 2.20" value={eligibility.min_cgpa}
                    onChange={(e) => setElig("min_cgpa", e.target.value)} />
                  <span className={styles.fieldHint}>Minimum CGPA required on a 5.0 scale.</span>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Allowed Levels of Study</label>
                  <div className={styles.checkboxGroup}>
                    {LEVEL_OPTIONS.map((level) => (
                      <label key={level} className={styles.checkboxLabel}>
                        <input type="checkbox" checked={eligibility.allowed_levels.includes(level)}
                          onChange={() => toggleLevel(level)} style={{ accentColor: "#15803d" }} />
                        {level}
                      </label>
                    ))}
                  </div>
                  <span className={styles.fieldHint}>Select all academic levels that are eligible. Leave empty for all levels.</span>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Ward Restriction</label>
                  <input className={styles.input}
                    placeholder="e.g. Effiat, Ewang (comma-separated, leave empty for all wards)"
                    value={eligibility.ward_restriction}
                    onChange={(e) => setElig("ward_restriction", e.target.value)} />
                  <span className={styles.fieldHint}>Restrict to specific wards. Comma-separated. Leave empty for open access.</span>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Max Prior Awards</label>
                  <input type="number" className={styles.input}
                    placeholder="e.g. 1" value={eligibility.max_prior_awards}
                    onChange={(e) => setElig("max_prior_awards", e.target.value)} />
                  <span className={styles.fieldHint}>Maximum number of prior awards a student can have.</span>
                </div>
              </>
            )}

            {(isEmpowerment || isGrant) && (
              <>
                <div className={styles.twoCol}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Minimum Age</label>
                    <input type="number" className={styles.input}
                      placeholder="e.g. 16" value={eligibility.min_age}
                      onChange={(e) => setElig("min_age", e.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Maximum Age</label>
                    <input type="number" className={styles.input}
                      placeholder="e.g. 35" value={eligibility.max_age}
                      onChange={(e) => setElig("max_age", e.target.value)} />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Ward Restriction</label>
                  <input className={styles.input}
                    placeholder="e.g. Effiat, Ewang (comma-separated, leave empty for all wards)"
                    value={eligibility.ward_restriction}
                    onChange={(e) => setElig("ward_restriction", e.target.value)} />
                  <span className={styles.fieldHint}>Restrict to specific wards. Comma-separated. Leave empty for open access.</span>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Max Prior Awards</label>
                  <input type="number" className={styles.input}
                    placeholder="e.g. 1" value={eligibility.max_prior_awards}
                    onChange={(e) => setElig("max_prior_awards", e.target.value)} />
                  <span className={styles.fieldHint}>Maximum number of prior awards a student can have.</span>
                </div>
              </>
            )}

            {isEmpowerment && (
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Allowed Trades / Skills</label>
                <input className={styles.input}
                  placeholder="e.g. Welding, Tailoring, ICT (comma-separated)"
                  value={eligibility.allowed_trades}
                  onChange={(e) => setElig("allowed_trades", e.target.value)} />
                <span className={styles.fieldHint}>Comma-separated list of trades eligible under this scheme.</span>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.rightCol}>

          {/* Award Details */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Award Details</h2>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Award Amount (â‚¦) {errors.award_amount && <span className={styles.fieldError}>{errors.award_amount}</span>}</label>
              <input type="number" className={`${styles.input} ${errors.award_amount ? styles.inputError : ""}`}
                placeholder="e.g. 500000" value={form.award_amount} onChange={(e) => set("award_amount", e.target.value)} />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Total Slots {errors.total_slots && <span className={styles.fieldError}>{errors.total_slots}</span>}</label>
              <input type="number" className={`${styles.input} ${errors.total_slots ? styles.inputError : ""}`}
                placeholder="e.g. 50" value={form.total_slots} onChange={(e) => set("total_slots", e.target.value)} />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Stacking Policy</label>
              <select className={styles.input} value={form.stacking_policy} onChange={(e) => set("stacking_policy", e.target.value)}>
                <option value="exclusive">Exclusive â€” no other active awards</option>
                <option value="major_only">Major Only â€” no other major awards</option>
                <option value="open">Open â€” can stack with any award</option>
              </select>
            </div>
          </div>

          {/* Preview */}
          <div className={styles.previewCard}>
            <p className={styles.previewLabel}>Preview</p>
            <div className={styles.previewTop}>
              <div className={styles.previewIcon} style={{ background: category.bg }}>
                <CatIcon size={16} color={category.color} strokeWidth={1.8} />
              </div>
              <span className={styles.previewPill} style={{ color: "#f59e0b", background: "#fffbeb", border: "1px solid #fde68a" }}>
                Draft
              </span>
            </div>
            <p className={styles.previewName}>{form.name || "Scheme name"}</p>
            <span className={styles.previewChip} style={{ color: category.color, background: category.bg }}>
              {category.label}
            </span>
            <div className={styles.previewMeta}>
              <span>â‚¦{form.award_amount ? Number(form.award_amount).toLocaleString() : "â€”"}</span>
              <span>Â·</span>
              <span>{form.total_slots || "â€”"} slots</span>
            </div>
          </div>

          {/* Submit */}
          <div className={styles.submitWrap}>
            <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading || success}>
              {loading
                ? <><Loader2 size={15} strokeWidth={2} className={styles.spin} /> Creating...</>
                : <><Plus size={15} strokeWidth={2} /> Create Scheme</>
              }
            </button>
            <p className={styles.submitNote}>
              Saved as draft. Publish from the schemes page when ready.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
