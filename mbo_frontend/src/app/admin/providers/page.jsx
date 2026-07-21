import { useState, useEffect } from "react";
import {
  Building2, Plus, Search, AlertCircle,
  Loader2, X, Edit2, Trash2,
} from "lucide-react";
import styles from "./page.module.css";
import { getProviders, createProvider, updateProvider, deleteProvider } from "@/services";

const PROVIDER_TYPES = [
  { value: "lga",       label: "LGA Council" },
  { value: "state",     label: "State Government" },
  { value: "corporate", label: "Corporate / CSR" },
  { value: "ngo",       label: "NGO / Foundation" },
  { value: "federal",   label: "Federal Government" },
];

function typeLabel(type) {
  const found = PROVIDER_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
}

const typeColors = {
  lga:       { color: "#15803d", bg: "#f0fdf4" },
  state:     { color: "#3b82f6", bg: "#eff6ff" },
  corporate: { color: "#7e22ce", bg: "#faf5ff" },
  ngo:       { color: "#b45309", bg: "#fffbeb" },
  federal:   { color: "#64748b", bg: "#f8fafc" },
};

function SkeletonRow() {
  return (
    <div className={styles.tableRow}>
      <div className={styles.skeletonCell} style={{ width: "30%" }} />
      <div className={styles.skeletonCell} style={{ width: "22%" }} />
      <div className={styles.skeletonCell} style={{ width: "20%" }} />
    </div>
  );
}

export default function ProvidersPage() {
  const [providers,    setProviders]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");

  const [showModal,    setShowModal]    = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [form,         setForm]         = useState({ name: "", provider_type: "lga" });
  const [saving,       setSaving]       = useState(false);
  const [saveError,    setSaveError]    = useState("");
  const [deleting,     setDeleting]     = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getProviders();
      setProviders(Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load providers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", provider_type: "lga" });
    setSaveError("");
    setShowModal(true);
  }

  function openEdit(provider) {
    setEditing(provider);
    setForm({ name: provider.name || "", provider_type: provider.provider_type || "lga" });
    setSaveError("");
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setSaveError("Provider name is required.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const body = { name: form.name.trim(), provider_type: form.provider_type };
      if (editing) {
        await updateProvider(editing.id, body);
      } else {
        await createProvider(body);
      }
      setShowModal(false);
      await load();
    } catch (err) {
      setSaveError(err?.response?.data?.error || err?.response?.data?.message || "Failed to save provider.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this provider?")) return;
    setDeleting(id);
    try {
      await deleteProvider(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete provider.");
    } finally {
      setDeleting(null);
    }
  }

  const filtered = providers.filter((p) =>
    search.trim() === "" ? true :
    (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.provider_type || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Building2 size={20} color="#15803d" strokeWidth={1.8} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h1 className={styles.title}>Providers</h1>
            <p className={styles.sub}>Manage scheme providers and funding organisations.</p>
          </div>
        </div>
        <button className={styles.createBtn} onClick={openCreate}>
          <Plus size={15} strokeWidth={2.5} /> New Provider
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={14} color="#dc2626" strokeWidth={2} />
          {error}
          <button className={styles.dismissBtn} onClick={() => setError(null)}><X size={12} strokeWidth={2} /></button>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input className={styles.searchInput} placeholder="Search providers..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {!loading && <span className={styles.count}>{filtered.length} provider{filtered.length !== 1 ? "s" : ""}</span>}
        </div>

        <div className={`${styles.tableRow} ${styles.tableHeader}`}>
          <span>Name</span>
          <span>Type</span>
          <span>Actions</span>
        </div>

        {loading && [1,2,3].map((i) => <SkeletonRow key={i} />)}

        {!loading && !error && filtered.length === 0 && (
          <div className={styles.emptyState}>
            <Building2 size={28} color="#cbd5e1" strokeWidth={1.5} />
            <p className={styles.emptyTitle}>{search ? "No matching providers" : "No providers yet"}</p>
            <p className={styles.emptySub}>{search ? "Try a different search." : "Create your first provider to get started."}</p>
          </div>
        )}

        {!loading && !error && filtered.map((provider) => {
          const tc = typeColors[provider.provider_type] || typeColors.lga;
          return (
            <div key={provider.id} className={styles.tableRowData}>
              <span className={styles.tdName}>{provider.name}</span>
              <span className={styles.tdType}>
                <span className={styles.typeChip} style={{ color: tc.color, background: tc.bg }}>
                  {typeLabel(provider.provider_type)}
                </span>
              </span>
              <div className={styles.tdActions}>
                <button className={styles.editBtn} onClick={() => openEdit(provider)} disabled={deleting === provider.id}>
                  <Edit2 size={12} strokeWidth={2} /> Edit
                </button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(provider.id)} disabled={deleting === provider.id}>
                  {deleting === provider.id ? <Loader2 size={12} strokeWidth={2} className={styles.spin} /> : <Trash2 size={12} strokeWidth={2} />}
                </button>
              </div>
            </div>
          );
        })}

        {!loading && !error && providers.length > 0 && (
          <div className={styles.tableFooter}>
            Showing {filtered.length} of {providers.length} providers
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <h2 className={styles.modalTitle}>{editing ? "Edit Provider" : "New Provider"}</h2>
                <p className={styles.modalSub}>{editing ? "Update the provider details." : "Add a new scheme provider."}</p>
              </div>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}><X size={15} strokeWidth={2} /></button>
            </div>

            {saveError && (
              <div className={styles.modalError}>
                <AlertCircle size={13} color="#dc2626" strokeWidth={2} />
                {saveError}
              </div>
            )}

            <div className={styles.modalForm}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Provider Name</label>
                <input className={styles.formInput} placeholder="e.g. Mbo LGA Council" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Provider Type</label>
                <select className={styles.formInput} value={form.provider_type} onChange={(e) => setForm((f) => ({ ...f, provider_type: e.target.value }))}>
                  {PROVIDER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button className={styles.submitBtn} onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 size={13} strokeWidth={2} className={styles.spin} /> Saving...</> : editing ? "Save Changes" : "Create Provider"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
