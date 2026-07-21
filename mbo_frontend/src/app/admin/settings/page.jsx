import { useState, useEffect } from "react";
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  Loader2, ShieldCheck, AlertCircle, Check, Settings,
} from "lucide-react";
import styles from "./page.module.css";
import { getMe } from "@/services/auth";
import { getSchemes, getStudents, getApplications } from "@/services";

// â”€â”€ PASSWORD STRENGTH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PasswordStrength({ password }) {
  const checks = [
    { label: "At least 8 characters",      pass: password.length >= 8 },
    { label: "Contains a number",           pass: /\d/.test(password) },
    { label: "Contains a letter",           pass: /[a-zA-Z]/.test(password) },
    { label: "Contains a special character",pass: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score    = checks.filter((c) => c.pass).length;
  const strength = score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong";
  const colors   = { Weak: "#ef4444", Fair: "#f59e0b", Good: "#3b82f6", Strong: "#15803d" };
  if (!password || score === 4) return null;
  return (
    <div className={styles.strengthWrap}>
      <div className={styles.strengthBars}>
        {[1,2,3,4].map((i) => (
          <div key={i} className={styles.strengthBar}
            style={{ background: i <= score ? colors[strength] : "#e2e8f0" }} />
        ))}
        <span className={styles.strengthLabel} style={{ color: colors[strength] }}>
          {strength}
        </span>
      </div>
    </div>
  );
}

// â”€â”€ SECTION WRAPPER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Section({ title, sub, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {sub && <p className={styles.sectionSub}>{sub}</p>}
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

// â”€â”€ ROLE BADGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function RoleBadge({ role }) {
  const config = {
    superadmin: { label: "Super Admin", color: "#7e22ce", bg: "#faf5ff", border: "#e9d5ff" },
    admin:      { label: "Admin",       color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
    verifier:   { label: "Verifier",    color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
  };
  const c = config[role] || config.admin;
  return (
    <span className={styles.roleBadge} style={{ color: c.color, background: c.bg, borderColor: c.border }}>
      {c.label}
    </span>
  );
}

// â”€â”€ PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AdminSettingsPage() {
  const [user,         setUser]         = useState(null);
  const [loadingUser,  setLoadingUser]  = useState(true);

  // Profile state
  const [phone,        setPhone]        = useState("");

  // Password state
  const [passwords,    setPasswords]    = useState({ current: "", newPass: "", confirm: "" });
  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [savingPwd,    setSavingPwd]    = useState(false);
  const [pwdSuccess,   setPwdSuccess]   = useState(false);
  const [pwdError,     setPwdError]     = useState("");
  const [editingPwd, setEditingPwd] = useState(false);

  const [stats, setStats] = useState({ schemes: 0, students: 0, applications: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // â”€â”€ LOAD CURRENT USER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getMe();
        if (cancelled) return;
        setUser(res.data);
        setPhone(res.data.phone_number || "");
      } catch {
        // Layout handles auth
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
  async function loadStats() {
    try {
      const [schemes, students, applications] = await Promise.all([
        getSchemes(),
        getStudents(),
        getApplications(),
      ]);
      setStats({
        schemes:      schemes.data?.count      ?? 0,
        students:     students.data?.count     ?? 0,
        applications: applications.data?.count ?? 0,
      });
    } catch {
      // Fail silently
    } finally {
      setLoadingStats(false);
    }
  }
  loadStats();
}, []);

  // â”€â”€ CHANGE PASSWORD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleChangePassword(e) {
    e.preventDefault();
    if (passwords.newPass.length < 8) { setPwdError("Password must be at least 8 characters."); return; }
    if (passwords.newPass !== passwords.confirm) { setPwdError("Passwords do not match."); return; }

    setSavingPwd(true);
    setPwdError("");
    setPwdSuccess(false);
    try {
      // NOTE: Wire to change password endpoint when backend adds it
      // await changePassword({ current_password: passwords.current, new_password: passwords.newPass });
      setPwdError("Password change is not yet available. Please contact an administrator.");
    } catch (err) {
      setPwdError(err?.response?.data?.detail || "Failed to change password.");
    } finally {
      setSavingPwd(false);
    }
  }

  // ── RENDER ───────────────────────────────────────────────────────────────

  if (loadingUser) {
    return (
      <div className={styles.centerState}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>

      <div className={styles.pageHeader}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Settings size={20} color="#15803d" strokeWidth={1.8} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.sub}>Manage your account and portal configuration.</p>
        </div>
      </div>

      {/* SYSTEM STATUS */}
      <div className={styles.statusStrip}>
        {[
          { label: "Total Schemes",      value: stats.schemes,      color: "#15803d" },
          { label: "Total Students",     value: stats.students,     color: "#1d4ed8" },
          { label: "Total Applications", value: stats.applications, color: "#b45309" },
        ].map((s) => (
          <div key={s.label} className={styles.statusItem}>
            <span className={styles.statusValue} style={{ color: s.color }}>
              {loadingStats ? "â€”" : s.value}
            </span>
            <span className={styles.statusLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* â”€â”€ SECTION 1: MY PROFILE â”€â”€ */}
      <Section title="My Profile" sub="Update your contact information.">
        <div className={styles.profileCard}>
          <div className={styles.profileAvatar}>
            {(user?.firstname?.[0] || "").toUpperCase()}
            {(user?.lastname?.[0]  || "").toUpperCase()}
          </div>

          <div className={styles.profileInfo}>
            <p className={styles.profileName}>{user?.firstname} {user?.lastname}</p>
            <p className={styles.profileEmail}>{user?.email}</p>
            <p className={styles.profileLastLogin}>
              Last login: {user?.last_login
                ? new Date(user.last_login).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })
                : "â€”"
              }
            </p>
            <RoleBadge role={user?.role} />
          </div>
        </div>

        <div className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>
                <User size={12} strokeWidth={2} /> First Name
              </label>
              <input
                className={`${styles.formInput} ${styles.formInputDisabled}`}
                value={user?.firstname || ""}
                disabled
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>
                <User size={12} strokeWidth={2} /> Last Name
              </label>
              <input
                className={`${styles.formInput} ${styles.formInputDisabled}`}
                value={user?.lastname || ""}
                disabled
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>
                <Mail size={12} strokeWidth={2} /> Email Address
              </label>
              <input
                className={`${styles.formInput} ${styles.formInputDisabled}`}
                value={user?.email || ""}
                disabled
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>
                <Phone size={12} strokeWidth={2} /> Phone Number
              </label>
              <input
                className={`${styles.formInput} ${styles.formInputDisabled}`}
                value={phone}
                disabled
              />
            </div>
          </div>
        </div>
      </Section>

      {/* â”€â”€ SECTION 2: CHANGE PASSWORD â”€â”€ */}
        <Section title="Password & Security" sub="Keep your account secure with a strong password.">
           {!editingPwd ? (
            <div className={styles.pwdEmptyState}>
              <div className={styles.pwdEmptyIcon}>
                <Lock size={20} strokeWidth={1.8} />
              </div>
              <div>
                <p className={styles.pwdEmptyTitle}>Password protected</p>
                <p className={styles.pwdEmptySub}>Your password is set. Click below to change it.</p>
              </div>
              <button className={styles.editBtn} onClick={() => setEditingPwd(true)}>
                <Lock size={13} strokeWidth={2} /> Change Password
              </button>
            </div>
          ) : (
          <>
            {pwdSuccess && (
              <div className={styles.successBanner}>
                <ShieldCheck size={14} strokeWidth={2} /> Password changed successfully.
              </div>
            )}
            {pwdError && (
              <div className={styles.errorBanner}>
                <AlertCircle size={14} strokeWidth={2} /> {pwdError}
              </div>
            )}

            <form className={styles.form} onSubmit={handleChangePassword}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  <Lock size={12} strokeWidth={2} /> Current Password
                </label>
                <div className={styles.pwdWrap}>
                  <input
                    type={showCurrent ? "text" : "password"}
                    className={styles.formInput}
                    value={passwords.current}
                    onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowCurrent((v) => !v)}>
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    <Lock size={12} strokeWidth={2} /> New Password
                  </label>
                  <div className={styles.pwdWrap}>
                    <input
                      type={showNew ? "text" : "password"}
                      className={styles.formInput}
                      value={passwords.newPass}
                      onChange={(e) => { setPasswords((p) => ({ ...p, newPass: e.target.value })); setPwdError(""); }}
                      placeholder="New password"
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowNew((v) => !v)}>
                      {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <PasswordStrength password={passwords.newPass} />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    <Lock size={12} strokeWidth={2} /> Confirm New Password
                  </label>
                  <div className={styles.pwdWrap}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      className={styles.formInput}
                      value={passwords.confirm}
                      onChange={(e) => { setPasswords((p) => ({ ...p, confirm: e.target.value })); setPwdError(""); }}
                      placeholder="Confirm password"
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm((v) => !v)}>
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {passwords.confirm && passwords.newPass === passwords.confirm && (
                    <span className={styles.matchHint}>
                      <Check size={12} strokeWidth={2.5} /> Passwords match
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.formFoot}>
                <button type="button" className={styles.cancelBtn} onClick={() => { setEditingPwd(false); setPasswords({ current: "", newPass: "", confirm: "" }); setPwdError(""); }}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={savingPwd}>
                  {savingPwd
                    ? <><Loader2 size={14} strokeWidth={2} className={styles.spin} /> Updating...</>
                    : <>Update Password</>
                  }
                </button>
              </div>
            </form>
          </>
        )}
      </Section>

    </div>
  );
}
