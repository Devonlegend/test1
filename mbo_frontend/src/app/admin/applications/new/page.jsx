import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Search, User, BookOpen, Banknote,
  GraduationCap, Briefcase, Check, AlertCircle, CheckCircle2,
  Loader2, UploadCloud, FileText, Trash2, Shield, ChevronDown,
} from "lucide-react";
import styles from "./page.module.css";
import {
  getStudents, getSchemes, getSchemeFields,
  staffCreateApplication, getBanks, verifyBank,
} from "@/services";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const categoryConfig = {
  scholarship: { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", icon: GraduationCap, label: "Scholarship" },
  empowerment: { color: "#b45309", bg: "#fffbeb", border: "#fde68a", icon: Briefcase,     label: "Empowerment" },
  grant:       { color: "#7e22ce", bg: "#faf5ff", border: "#e9d5ff", icon: Banknote,      label: "Grant" },
};

const STEPS = [
  { key: "student", label: "Student",   icon: User },
  { key: "scheme",  label: "Scheme",    icon: BookOpen },
  { key: "details", label: "Details",   icon: FileText },
  { key: "bank",    label: "Bank",      icon: Banknote },
  { key: "review",  label: "Review",    icon: Shield },
];

const STATUS_OPTIONS = [
  { value: "",                     label: "Let engine decide (default)" },
  { value: "submitted",           label: "Submitted" },
  { value: "document_review",     label: "Document Review" },
  { value: "shortlisted",         label: "Shortlisted" },
  { value: "approved",            label: "Approved" },
];

// â”€â”€ STEPPER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Stepper({ steps, current, completed }) {
  return (
    <nav className={styles.stepper}>
      {steps.map((step, i) => {
        const Icon = step.icon;
        const done = completed.includes(step.key);
        const active = step.key === current;
        return (
          <div
            key={step.key}
            className={`${styles.step} ${active ? styles.stepActive : ""} ${done ? styles.stepDone : ""}`}
          >
            <div className={`${styles.stepDot} ${active ? styles.stepDotActive : ""} ${done ? styles.stepDotDone : ""}`}>
              {done ? <Check size={14} /> : <Icon size={14} />}
            </div>
            <span className={styles.stepLabel}>{step.label}</span>
          </div>
        );
      })}
    </nav>
  );
}

// â”€â”€ STUDENT SEARCH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StudentStep({ student, onSelect }) {
  const [query, setQuery] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let cancel = false;
    async function load() {
      try {
        const res = await getStudents();
        const data = Array.isArray(res.data?.results) ? res.data.results :
                     Array.isArray(res.data) ? res.data : [];
        if (!cancel) setAllStudents(data);
      } catch {} finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => { cancel = true; };
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allStudents.filter((s) => {
      const name = `${s.firstname || ""} ${s.lastname || ""}`.toLowerCase();
      const email = (s.user_email || s.email || "").toLowerCase();
      const matric = (s.matric_number || "").toLowerCase();
      return name.includes(q) || email.includes(q) || matric.includes(q);
    }).slice(0, 20);
  }, [query, allStudents]);

  if (student) {
    return (
      <div className={styles.selectedCard}>
        <div className={styles.selectedHeader}>
          <div className={styles.selectedIcon}>
            <User size={18} color="#15803d" />
          </div>
          <div>
            <div className={styles.selectedName}>{student.firstname} {student.lastname}</div>
            <div className={styles.selectedMeta}>
              {student.matric_number && <span>{student.matric_number}</span>}
              {student.ward && <span>{student.ward} Ward</span>}
            </div>
          </div>
          <button type="button" className={styles.changeBtn} onClick={() => onSelect(null)}>
            Change
          </button>
        </div>
        <div className={styles.studentDetails}>
          {student.level && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Level</span>
              <span className={styles.detailValue}>{student.level}</span>
            </div>
          )}
          {student.cgpa && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>CGPA</span>
              <span className={styles.detailValue}>{student.cgpa}</span>
            </div>
          )}
          {student.active_award && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Active Award</span>
              <span className={`${styles.detailValue} ${styles.warnText}`}>{student.active_award}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.searchBox}>
        <Search size={16} color="#94a3b8" />
        <input
          type="text"
          placeholder="Search by name, email, or matric number..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSearching(true); }}
          className={styles.searchInput}
        />
        {loading && <Loader2 size={16} color="#94a3b8" className={styles.spin} />}
      </div>
      {query.trim() && results.length > 0 && (
        <div className={styles.searchResults}>
          {results.map((s) => (
            <button
              key={s.id}
              type="button"
              className={styles.searchResult}
              onClick={() => { onSelect(s); setQuery(""); setSearching(false); }}
            >
              <div className={styles.resultName}>{s.firstname} {s.lastname}</div>
              <div className={styles.resultMeta}>
                {s.matric_number && <span>{s.matric_number}</span>}
                {s.ward && <span>{s.ward} Ward</span>}
              </div>
            </button>
          ))}
        </div>
      )}
      {query.trim() && results.length === 0 && !loading && (
        <div className={styles.emptyState}>No students match &ldquo;{query}&rdquo;</div>
      )}
    </div>
  );
}

// â”€â”€ SCHEME SELECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SchemeStep({ scheme, onSelect }) {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    async function load() {
      try {
        const res = await getSchemes();
        const data = Array.isArray(res.data?.results) ? res.data.results :
                     Array.isArray(res.data) ? res.data : [];
        if (!cancel) setSchemes(data);
      } catch {} finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => { cancel = true; };
  }, []);

  if (scheme) {
    const cat = categoryConfig[scheme.award_type] || {};
    return (
      <div className={styles.selectedCard}>
        <div className={styles.selectedHeader}>
          <div className={styles.selectedIcon} style={{ background: cat.bg }}>
            {cat.icon ? <cat.icon size={18} color={cat.color} /> : <BookOpen size={18} />}
          </div>
          <div>
            <div className={styles.selectedName}>{scheme.name}</div>
            <div className={styles.selectedMeta}>
              <span className={styles.badge} style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
                {cat.label || scheme.award_type}
              </span>
              <span>{scheme.award_amount ? `#${Number(scheme.award_amount).toLocaleString()}` : ""}</span>
              <span>{scheme.remaining_slots ?? "?"} slots left</span>
            </div>
          </div>
          <button type="button" className={styles.changeBtn} onClick={() => onSelect(null)}>
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {loading ? (
        <div className={styles.loadingState}><Loader2 size={20} className={styles.spin} /> Loading schemes...</div>
      ) : (
        <div className={styles.schemeList}>
          {schemes.map((s) => {
            const cat = categoryConfig[s.award_type] || {};
            const isOpen = s.status === "open" || s.is_open;
            return (
              <button
                key={s.id}
                type="button"
                className={`${styles.schemeCard} ${!isOpen ? styles.schemeCardDisabled : ""}`}
                onClick={() => isOpen && onSelect(s)}
                disabled={!isOpen}
              >
                <div className={styles.schemeCardIcon} style={{ background: cat.bg }}>
                  {cat.icon ? <cat.icon size={18} color={cat.color} /> : <BookOpen size={18} />}
                </div>
                <div className={styles.schemeCardBody}>
                  <div className={styles.schemeCardName}>{s.name}</div>
                  <div className={styles.schemeCardMeta}>
                    <span className={styles.badge} style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
                      {cat.label || s.award_type}
                    </span>
                    {s.award_amount && <span>#{Number(s.award_amount).toLocaleString()}</span>}
                    <span>{s.remaining_slots ?? "?"} slots</span>
                  </div>
                </div>
                {!isOpen && <span className={styles.closedBadge}>Closed</span>}
              </button>
            );
          })}
          {schemes.length === 0 && (
            <div className={styles.emptyState}>No schemes available.</div>
          )}
        </div>
      )}
    </div>
  );
}

// â”€â”€ DYNAMIC FIELD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DynamicField({ field, value, onChange, error }) {
  const { field_name, field_label, field_type, placeholder, is_required, options } = field;
  const label = (
    <label className={styles.fieldLabel}>
      {field_label}
      {is_required && <span className={styles.required}>*</span>}
    </label>
  );

  if (field_type === "textarea") {
    return (
      <div className={styles.field}>
        {label}
        <textarea
          name={field_name} value={value || ""} onChange={onChange}
          placeholder={placeholder || ""} rows={3}
          className={`${styles.textarea} ${error ? styles.inputError : ""}`}
        />
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }

  if (field_type === "select") {
    return (
      <div className={styles.field}>
        {label}
        <select
          name={field_name} value={value || ""} onChange={onChange}
          className={`${styles.select} ${error ? styles.inputError : ""}`}
        >
          <option value="">Select an option</option>
          {(options || []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }

  if (field_type === "radio") {
    return (
      <div className={styles.field}>
        {label}
        <div className={styles.radioGroup}>
          {(options || []).map((opt) => (
            <label key={opt} className={`${styles.radioCard} ${value === opt ? styles.radioCardActive : ""}`}>
              <input type="radio" name={field_name} value={opt} checked={value === opt} onChange={onChange} />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }

  if (field_type === "checkbox") {
    return (
      <div className={styles.field}>
        <label className={styles.checkRow}>
          <input type="checkbox" name={field_name} checked={!!value} onChange={onChange} className={styles.checkbox} />
          <span>{field_label}</span>
        </label>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }

  return (
    <div className={styles.field}>
      {label}
      <input
        type={field_type === "number" ? "number" : "text"}
        name={field_name} value={value || ""} onChange={onChange}
        placeholder={placeholder || ""}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

// â”€â”€ MAIN PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function NewApplicationPage() {
  const router = useRouter();

  // Step management
  const [stepIndex, setStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Data
  const [student, setStudent] = useState(null);
  const [scheme, setScheme] = useState(null);
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  // Bank state
  const [banks, setBanks] = useState([]);
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankVerifying, setBankVerifying] = useState(false);
  const [bankResult, setBankResult] = useState(null);
  const [bankError, setBankError] = useState("");

  // Declaration
  const [declaredExternal, setDeclaredExternal] = useState("");
  const [declarationRows, setDeclarationRows] = useState([
    { organisation: "", category: "", year: "" },
  ]);

  // Attestation + status
  const [attested, setAttested] = useState(false);
  const [statusOverride, setStatusOverride] = useState("");

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(null);

  const currentStep = STEPS[stepIndex];

  // â”€â”€ Load banks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    let cancel = false;
    async function load() {
      try {
        const res = await getBanks();
        if (!cancel) setBanks(Array.isArray(res.data?.banks) ? res.data.banks : []);
      } catch {}
    }
    load();
    return () => { cancel = true; };
  }, []);

  // â”€â”€ Load scheme fields when scheme is selected â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!scheme) return;
    let cancel = false;
    async function load() {
      try {
        const res = await getSchemeFields(scheme.id);
        if (!cancel) setFields(Array.isArray(res.data) ? res.data : []);
      } catch {}
    }
    load();
    return () => { cancel = true; };
  }, [scheme]);

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function handleFieldChange(e) {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === "checkbox" ? checked : value }));
    setErrors((er) => ({ ...er, [name]: "" }));
  }

  function handleBankSelect(e) {
    const code = e.target.value;
    const selected = banks.find((b) => b.code === code);
    setBankCode(code);
    setBankName(selected?.name || "");
    setBankResult(null);
    setBankError("");
  }

  async function handleVerifyBank() {
    if (!bankCode) { setBankError("Select a bank."); return; }
    if (accountNumber.length !== 10 || !/^\d+$/.test(accountNumber)) {
      setBankError("Account number must be exactly 10 digits."); return;
    }
    setBankVerifying(true);
    setBankError("");
    try {
      const res = await verifyBank({ account_number: accountNumber, bank_code: bankCode });
      setBankResult(res.data);
    } catch (err) {
      setBankError(err?.response?.data?.error || "Could not verify account.");
    } finally {
      setBankVerifying(false);
    }
  }

  function handleDeclarationRowChange(index, field, value) {
    setDeclarationRows((rows) =>
      rows.map((row, i) => i === index ? { ...row, [field]: value } : row)
    );
  }

  // â”€â”€ Validation per step â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function validateStep() {
    const e = {};

    if (currentStep.key === "student") {
      if (!student) e.student = "Select a student.";
    }

    if (currentStep.key === "scheme") {
      if (!scheme) e.scheme = "Select a scheme.";
    }

    if (currentStep.key === "details") {
      for (const field of fields) {
        if (!field.is_required) continue;
        if (field.field_type === "checkbox") {
          if (!values[field.field_name]) e[field.field_name] = "Required.";
        } else {
          if (!values[field.field_name]?.toString().trim()) e[field.field_name] = "Required.";
        }
      }
    }

    if (currentStep.key === "bank") {
      if (!bankResult) e.bank = "Verify your bank account.";
    }

    if (currentStep.key === "review") {
      if (!declaredExternal) e.declared_external = "Please select an option.";
      if (declaredExternal === "yes") {
        const hasEmpty = declarationRows.some(
          (r) => !r.organisation.trim() || !r.category.trim() || !r.year
        );
        if (hasEmpty) e.declaration_details = "Complete all declaration rows.";
      }
      if (!attested) e.attested = "You must agree to the declaration.";
    }

    return e;
  }

  function handleNext() {
    const e = validateStep();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setCompletedSteps((prev) => [...new Set([...prev, currentStep.key])]);
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function handleBack() {
    setErrors({});
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleSubmit() {
    const e = validateStep();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSubmitting(true);
    setApiError("");

    try {
      const programme_answers = {};
      for (const field of fields) {
        if (field.field_type !== "file") {
          programme_answers[field.field_name] = values[field.field_name] ?? "";
        }
      }

      const self_declaration_details = declaredExternal === "yes"
        ? declarationRows.map((r) => ({
            organisation: r.organisation.trim(),
            category: r.category.trim(),
            year: parseInt(r.year) || new Date().getFullYear(),
          }))
        : [];

      const payload = {
        student_id: student.id,
        scheme_id: scheme.id,
        programme_answers,
        bank_account_number: accountNumber,
        bank_code: bankCode,
        bank_name: bankName,
        bank_account_name: bankResult?.account_name || "",
        bank_name_match_passed: bankResult?.name_match?.passed || false,
        self_declaration_received_support: declaredExternal === "yes",
        self_declaration_details,
        attestation_agreed: attested,
      };
      if (statusOverride) payload.status_override = statusOverride;

      await staffCreateApplication(payload);
      setSuccess({ id: "done" });
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || "Failed to create application.";
      setApiError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  }

  // â”€â”€ Success state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <CheckCircle2 size={40} color="#15803d" />
          </div>
          <h2 className={styles.successTitle}>Application Created</h2>
          <p className={styles.successText}>
            The application for {student.firstname} {student.lastname} has been created successfully.
          </p>
          <div className={styles.successActions}>
            <button type="button" className={styles.btnPrimary} onClick={() => router.push("/admin/applications")}>
              View Applications
            </button>
            <button type="button" className={styles.btnOutline} onClick={() => {
              setSuccess(null); setStudent(null); setScheme(null); setValues({});
              setBankCode(""); setBankName(""); setAccountNumber(""); setBankResult(null);
              setDeclaredExternal(""); setAttested(false); setStatusOverride("");
              setStepIndex(0); setCompletedSteps([]);
            }}>
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // â”€â”€ Render step content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function renderStep() {
    switch (currentStep.key) {
      case "student":
        return (
          <div>
            <h3 className={styles.stepTitle}>Select Student</h3>
            <p className={styles.stepDesc}>Search for the student you want to create an application for.</p>
            <StudentStep student={student} onSelect={setStudent} />
            {errors.student && <div className={styles.fieldError}><AlertCircle size={14} /> {errors.student}</div>}
          </div>
        );

      case "scheme":
        return (
          <div>
            <h3 className={styles.stepTitle}>Select Scheme</h3>
            <p className={styles.stepDesc}>Choose the scholarship, grant, or empowerment scheme.</p>
            <SchemeStep scheme={scheme} onSelect={setScheme} />
            {errors.scheme && <div className={styles.fieldError}><AlertCircle size={14} /> {errors.scheme}</div>}
          </div>
        );

      case "details":
        return (
          <div>
            <h3 className={styles.stepTitle}>Programme Details</h3>
            <p className={styles.stepDesc}>
              Fill in the application details for this {scheme?.award_type} scheme.
            </p>
            {fields.length > 0 ? (
              <div className={styles.fieldsGrid}>
                {fields.map((field) => (
                  <DynamicField
                    key={field.field_name}
                    field={field}
                    value={values[field.field_name]}
                    onChange={handleFieldChange}
                    error={errors[field.field_name]}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>No fields defined for this scheme.</div>
            )}
          </div>
        );

      case "bank":
        return (
          <div>
            <h3 className={styles.stepTitle}>Bank Account</h3>
            <p className={styles.stepDesc}>Enter and verify the student&apos;s bank account details.</p>
            <div className={styles.fieldsGrid}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Bank <span className={styles.required}>*</span></label>
                <select value={bankCode} onChange={handleBankSelect} className={styles.select}>
                  <option value="">Select a bank</option>
                  {banks.map((b) => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Account Number <span className={styles.required}>*</span></label>
                <input
                  type="text" maxLength={10} value={accountNumber}
                  onChange={(e) => { setAccountNumber(e.target.value); setBankResult(null); }}
                  placeholder="10-digit account number"
                  className={styles.input}
                />
              </div>
            </div>
            <button
              type="button" onClick={handleVerifyBank}
              className={styles.btnVerify}
              disabled={bankVerifying || !bankCode || accountNumber.length !== 10}
            >
              {bankVerifying ? <><Loader2 size={14} className={styles.spin} /> Verifying...</> : "Verify Account"}
            </button>
            {bankResult && (
              <div className={styles.bankResult}>
                <CheckCircle2 size={16} color="#15803d" />
                <div>
                  <div className={styles.bankName}>{bankResult.account_name}</div>
                  <div className={styles.bankMatch}>
                    {bankResult.name_match?.passed ? "Name matches student" : "Name does not match"}
                  </div>
                </div>
              </div>
            )}
            {bankError && <div className={styles.fieldError}><AlertCircle size={14} /> {bankError}</div>}
            {errors.bank && <div className={styles.fieldError}><AlertCircle size={14} /> {errors.bank}</div>}
          </div>
        );

      case "review":
        return (
          <div>
            <h3 className={styles.stepTitle}>Review & Submit</h3>
            <p className={styles.stepDesc}>Review the application details, complete declarations, and submit.</p>

            {/* Summary */}
            <div className={styles.summarySection}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Student</span>
                <span className={styles.summaryValue}>{student?.firstname} {student?.lastname}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Scheme</span>
                <span className={styles.summaryValue}>{scheme?.name}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Award Type</span>
                <span className={styles.summaryValue}>{categoryConfig[scheme?.award_type]?.label || scheme?.award_type}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Bank</span>
                <span className={styles.summaryValue}>{bankName} Â· {accountNumber}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Account Name</span>
                <span className={styles.summaryValue}>{bankResult?.account_name || "â€”"}</span>
              </div>
            </div>

            {/* Declaration */}
            <div className={styles.declSection}>
              <label className={styles.fieldLabel}>Has the student received prior support from the Trust?</label>
              <div className={styles.radioGroup}>
                <label className={`${styles.radioCard} ${declaredExternal === "no" ? styles.radioCardActive : ""}`}>
                  <input type="radio" name="declared" value="no" checked={declaredExternal === "no"}
                    onChange={() => { setDeclaredExternal("no"); setDeclarationRows([{ organisation: "", category: "", year: "" }]); }} />
                  <span>No</span>
                </label>
                <label className={`${styles.radioCard} ${declaredExternal === "yes" ? styles.radioCardActive : ""}`}>
                  <input type="radio" name="declared" value="yes" checked={declaredExternal === "yes"}
                    onChange={() => setDeclaredExternal("yes")} />
                  <span>Yes</span>
                </label>
              </div>
              {errors.declared_external && <span className={styles.errorText}>{errors.declared_external}</span>}

              {declaredExternal === "yes" && (
                <div className={styles.declRows}>
                  {declarationRows.map((row, i) => (
                    <div key={i} className={styles.declRow}>
                      <input
                        type="text" placeholder="Organisation" value={row.organisation}
                        onChange={(e) => handleDeclarationRowChange(i, "organisation", e.target.value)}
                        className={styles.input}
                      />
                      <input
                        type="text" placeholder="Category" value={row.category}
                        onChange={(e) => handleDeclarationRowChange(i, "category", e.target.value)}
                        className={styles.input}
                      />
                      <input
                        type="number" placeholder="Year" value={row.year}
                        onChange={(e) => handleDeclarationRowChange(i, "year", e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  ))}
                  <button type="button" className={styles.btnAddRow} onClick={() =>
                    setDeclarationRows((r) => [...r, { organisation: "", category: "", year: "" }])
                  }>+ Add Row</button>
                </div>
              )}
              {errors.declaration_details && <span className={styles.errorText}>{errors.declaration_details}</span>}
            </div>

            {/* Attestation */}
            <div className={styles.attestSection}>
              <label className={styles.checkRow}>
                <input type="checkbox" checked={attested} onChange={(e) => setAttested(e.target.checked)}
                  className={styles.checkbox} />
                <span>I attest that the information provided is accurate and complete.</span>
              </label>
              {errors.attested && <span className={styles.errorText}>{errors.attested}</span>}
            </div>

            {/* Status Override */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Initial Status Override (optional)</label>
              <select value={statusOverride} onChange={(e) => setStatusOverride(e.target.value)} className={styles.select}>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className={styles.fieldHint}>
                Leave as default to let the eligibility engine decide. Override to skip review.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={() => router.push("/admin/applications")}>
          <ArrowLeft size={16} /> Applications
        </button>
        <h1 className={styles.pageTitle}>Create Application</h1>
      </div>

      <div className={styles.layout}>
        <Stepper steps={STEPS} current={currentStep.key} completed={completedSteps} />

        <div className={styles.formCard}>
          {renderStep()}

          {apiError && (
            <div className={styles.apiError}>
              <AlertCircle size={14} /> {apiError}
            </div>
          )}

          <div className={styles.formActions}>
            {stepIndex > 0 && (
              <button type="button" className={styles.btnOutline} onClick={handleBack}>
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <div className={styles.formActionsRight}>
              {stepIndex < STEPS.length - 1 ? (
                <button type="button" className={styles.btnPrimary} onClick={handleNext}>
                  Next <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button" className={styles.btnPrimary}
                  onClick={handleSubmit} disabled={submitting}
                >
                  {submitting ? <><Loader2 size={14} className={styles.spin} /> Creating...</> : "Create Application"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
