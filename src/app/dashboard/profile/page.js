"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  IdCard, ShieldCheck, Save, Loader2,
  Lock, ChevronRight, User, Mail, Phone,
  MapPin, Calendar, Users, Pencil, X, AlertCircle,
} from "lucide-react";
import styles from "./page.module.css";
import LoadingSpinner from "../components/LoadingSpinner";
import { getMe, getStudentProfile, updateStudentProfile } from "@/services";

function ReadField({ icon: Icon, label, value, dimmed }) {
  return (
    <div className={styles.field} style={dimmed ? { opacity: 0.4 } : {}}>
      <label className={styles.label}>
        {Icon && <Icon size={12} strokeWidth={2} />} {label}
      </label>
      <div className={styles.readValue}>{value || "—"}</div>
    </div>
  );
}

export default function ProfilePage() {
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [apiError, setApiError] = useState("");
  const [photo,    setPhoto]    = useState(null);

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    dob: "", gender: "", lga: "", ward: "", nin_masked: "",
  });
  const [draft, setDraft] = useState({ ...form });

  const initials =
    (form.first_name?.[0]?.toUpperCase() || "") +
    (form.last_name?.[0]?.toUpperCase()  || "");

  useEffect(() => {
    async function loadProfile() {
      try {
        const [authRes, studentRes] = await Promise.all([getMe(), getStudentProfile()]);
        const auth    = authRes.data;
        const profile = studentRes.data;
        const loaded = {
          first_name: auth.firstname     || "",
          last_name:  auth.lastname      || "",
          email:      auth.email         || "",
          phone:      auth.phone_number  || "",
          dob:        auth.date_of_birth || "",
          gender:     auth.gender        || "",
          lga:        profile.lga        || "",
          ward:       profile.ward       || "",
          nin_masked: "****-****-****",
        };
        setForm(loaded);
        setDraft(loaded);
        if (auth.passport) setPhoto(auth.passport);
      } catch {
        setApiError("Failed to load profile. Please refresh.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // ── PROFILE HANDLERS ──────────────────────────────────────────────────────
  function handleDraftField(e) {
    setDraft((d) => ({ ...d, [e.target.name]: e.target.value }));
    setSaved(false);
    setApiError("");
  }

  function handleEdit() {
    setDraft({ ...form });
    setSaved(false);
    setApiError("");
    setEditing(true);
  }

  function handleCancel() {
    setDraft({ ...form });
    setEditing(false);
    setApiError("");
  }

  async function handleSave(e) {
    e?.preventDefault();
    setSaving(true);
    setApiError("");
    try {
      await updateStudentProfile({ phone_number: draft.phone, email: draft.email });
      setForm((f) => ({ ...f, phone: draft.phone, email: draft.email }));
      setSaved(true);
      setEditing(false);
    } catch (err) {
      setApiError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to save changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <div className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div className={styles.avatarWrap}>
            {photo ? (
              <img
                src={photo}
                alt="Passport"
                className={styles.avatarImg}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={styles.avatarInitials}
              style={{ display: photo ? 'none' : 'flex' }}
            >
              {initials}
            </div>
          </div>
          <div className={styles.heroMeta}>
            <h1 className={styles.heroName}>{form.first_name} {form.last_name}</h1>
            <p className={styles.heroEmail}>{form.email}</p>
          </div>
        </div>
      </div>

      {/* ── PERSONAL INFORMATION ── */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div className={styles.cardHeadIcon}>
            <User size={15} strokeWidth={2.2} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 className={styles.cardTitle}>Personal Information</h2>
            <p className={styles.cardSub}>Your registered profile details.</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {editing && (
              <button type="button" className={styles.btnCancel} onClick={handleCancel}>
                <X size={13} strokeWidth={2} /> Cancel
              </button>
            )}
            <button
              type="button"
              className={styles.btnEdit}
              onClick={editing ? handleSave : handleEdit}
              disabled={saving}
            >
              {saving ? (
                <><Loader2 size={13} strokeWidth={2} className={styles.spin} /> Saving...</>
              ) : editing ? (
                <><Save size={13} strokeWidth={2} /> Save</>
              ) : (
                <><Pencil size={13} strokeWidth={2} /> Edit</>
              )}
            </button>
          </div>
        </div>

        {apiError && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 8, padding: "10px 14px",
            fontSize: 13, color: "#dc2626", marginBottom: 4,
          }}>
            <AlertCircle size={14} strokeWidth={2} /> {apiError}
          </div>
        )}

        {saved && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 8, padding: "10px 14px",
            fontSize: 13, color: "#15803d", marginBottom: 4,
          }}>
            <ShieldCheck size={14} strokeWidth={2} /> Changes saved successfully
          </div>
        )}

        <div className={styles.form}>
          <div className={styles.row2}>
            <ReadField icon={User}     label="First Name"    value={form.first_name} dimmed={editing} />
            <ReadField icon={User}     label="Last Name"     value={form.last_name}  dimmed={editing} />
          </div>

          <div className={styles.row2}>
            {editing ? (
              <div className={styles.field}>
                <label className={styles.label}><Mail size={12} strokeWidth={2} /> Email Address</label>
                <input className={styles.input} name="email" type="email"
                  value={draft.email} onChange={handleDraftField} placeholder="Email" />
              </div>
            ) : (
              <ReadField icon={Mail} label="Email Address" value={form.email} />
            )}
            {editing ? (
              <div className={styles.field}>
                <label className={styles.label}><Phone size={12} strokeWidth={2} /> Phone Number</label>
                <input className={styles.input} name="phone"
                  value={draft.phone} onChange={handleDraftField} placeholder="+234..." />
              </div>
            ) : (
              <ReadField icon={Phone} label="Phone Number" value={form.phone} />
            )}
          </div>

          <div className={styles.row2}>
            <ReadField icon={Calendar} label="Date of Birth" value={form.dob}     dimmed={editing} />
            <ReadField icon={Users}    label="Gender"        value={form.gender ? form.gender.charAt(0).toUpperCase() + form.gender.slice(1) : "—"} dimmed={editing} />
          </div>

          <div className={styles.row2}>
            <ReadField icon={MapPin} label="LGA"  value={form.lga}  dimmed={editing} />
            <ReadField icon={MapPin} label="Ward" value={form.ward} dimmed={editing} />
          </div>

          <ReadField icon={IdCard} label="National ID (NIN)" value={form.nin_masked} dimmed={editing} />
        </div>
      </div>

      {/* ── SECURITY LINK ── */}
      <Link href="/dashboard/settings" className={styles.securityLink}>
        <div className={styles.securityLinkLeft}>
          <div className={styles.securityIcon}>
            <Lock size={16} strokeWidth={2.2} />
          </div>
          <div>
            <p className={styles.securityTitle}>Password &amp; Security</p>
            <p className={styles.securitySub}>Change your password and manage account security</p>
          </div>
        </div>
        <ChevronRight size={16} strokeWidth={2} className={styles.securityChevron} />
      </Link>

    </div>
  );
}