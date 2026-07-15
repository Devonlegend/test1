"use client";
import { useState, useEffect, useRef } from "react";
import {
  CalendarRange, Plus, Search, AlertCircle, CheckCircle2,
  Loader2, X, Edit2, Trash2, ArrowUp,
} from "lucide-react";
import styles from "./page.module.css";
import { getCycles, createCycle, activateCycle, updateCycle, deleteCycle } from "@/services";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function SkeletonRow() {
  return (
    <div className={styles.tableRow}>
      <div className={styles.skeletonCell} style={{ width: "22%" }} />
      <div className={styles.skeletonCell} style={{ width: "14%" }} />
      <div className={styles.skeletonCell} style={{ width: "14%" }} />
      <div className={styles.skeletonCell} style={{ width: "16%" }} />
      <div className={styles.skeletonCell} style={{ width: "20%" }} />
    </div>
  );
}

export default function CyclesPage() {
  const [cycles,       setCycles]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");

  const [showModal,    setShowModal]    = useState(false);
  const [editingCycle, setEditingCycle] = useState(null);
  const [form,         setForm]         = useState({ name: "", start_year: "", end_year: "" });
  const [saving,       setSaving]       = useState(false);
  const [saveError,    setSaveError]    = useState("");
  const [activating,   setActivating]   = useState(null);
  const [deleting,     setDeleting]     = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getCycles();
      setCycles(Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load cycles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingCycle(null);
    setForm({ name: "", start_year: "", end_year: "" });
    setSaveError("");
    setShowModal(true);
  }

  function openEdit(cycle) {
    setEditingCycle(cycle);
    setForm({
      name: cycle.name || "",
      start_year: String(cycle.start_year || ""),
      end_year: String(cycle.end_year || ""),
    });
    setSaveError("");
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.start_year || !form.end_year) {
      setSaveError("All fields are required.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const body = { name: form.name.trim(), start_year: parseInt(form.start_year), end_year: parseInt(form.end_year) };
      if (editingCycle) {
        await updateCycle(editingCycle.id, body);
      } else {
        await createCycle(body);
      }
      setShowModal(false);
      await load();
    } catch (err) {
      setSaveError(err?.response?.data?.error || err?.response?.data?.message || "Failed to save cycle.");
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate(id) {
    setActivating(id);
    try {
      await activateCycle(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to activate cycle.");
    } finally {
      setActivating(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this cycle? This action cannot be undone.")) return;
    setDeleting(id);
    try {
      await deleteCycle(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete cycle.");
    } finally {
      setDeleting(null);
    }
  }

  const filtered = cycles.filter((c) =>
    search.trim() === "" ? true :
    (c.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCycle = cycles.find((c) => c.is_active);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CalendarRange size={20} color="#15803d" strokeWidth={1.8} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h1 className={styles.title}>Cycles</h1>
            <p className={styles.sub}>Manage academic and programme cycles.</p>
          </div>
        </div>
        <button className={styles.createBtn} onClick={openCreate}>
          <Plus size={15} strokeWidth={2.5} /> New Cycle
        </button>
      </div>

      {activeCycle && (
        <div className={styles.activeBanner}>
          <CheckCircle2 size={14} color="#15803d" strokeWidth={2} />
          <span>Active cycle: <strong>{activeCycle.name}</strong> ({activeCycle.start_year}/{activeCycle.end_year})</span>
        </div>
      )}

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
            <input className={styles.searchInput} placeholder="Search cycles..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {!loading && <span className={styles.count}>{filtered.length} cycle{filtered.length !== 1 ? "s" : ""}</span>}
        </div>

        <div className={`${styles.tableRow} ${styles.tableHeader}`}>
          <span>Name</span>
          <span>Start Year</span>
          <span>End Year</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading && [1,2,3,4].map((i) => <SkeletonRow key={i} />)}

        {!loading && !error && filtered.length === 0 && (
          <div className={styles.emptyState}>
            <CalendarRange size={28} color="#cbd5e1" strokeWidth={1.5} />
            <p className={styles.emptyTitle}>{search ? "No matching cycles" : "No cycles yet"}</p>
            <p className={styles.emptySub}>{search ? "Try a different search." : "Create your first cycle to get started."}</p>
          </div>
        )}

        {!loading && !error && filtered.map((cycle) => (
          <div key={cycle.id} className={`${styles.tableRowData} ${cycle.is_active ? styles.rowActive : ""}`}>
            <span className={styles.tdName}>{cycle.name}</span>
            <span className={styles.tdYear}>{cycle.start_year}</span>
            <span className={styles.tdYear}>{cycle.end_year}</span>
            <span className={styles.tdStatus}>
              {cycle.is_active ? (
                <span className={styles.activePill}>Active</span>
              ) : (
                <span className={styles.inactivePill}>Inactive</span>
              )}
            </span>
            <div className={styles.tdActions}>
              {!cycle.is_active && (
                <button className={styles.activateBtn} onClick={() => handleActivate(cycle.id)} disabled={activating === cycle.id}>
                  {activating === cycle.id ? <Loader2 size={12} strokeWidth={2} className={styles.spin} /> : <ArrowUp size={12} strokeWidth={2} />}
                  Activate
                </button>
              )}
              <button className={styles.editBtn} onClick={() => openEdit(cycle)} disabled={deleting === cycle.id}>
                <Edit2 size={12} strokeWidth={2} /> Edit
              </button>
              {!cycle.is_active && (
                <button className={styles.deleteBtn} onClick={() => handleDelete(cycle.id)} disabled={deleting === cycle.id}>
                  {deleting === cycle.id ? <Loader2 size={12} strokeWidth={2} className={styles.spin} /> : <Trash2 size={12} strokeWidth={2} />}
                </button>
              )}
            </div>
          </div>
        ))}

        {!loading && !error && cycles.length > 0 && (
          <div className={styles.tableFooter}>
            Showing {filtered.length} of {cycles.length} cycles
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <h2 className={styles.modalTitle}>{editingCycle ? "Edit Cycle" : "New Cycle"}</h2>
                <p className={styles.modalSub}>{editingCycle ? "Update the cycle details." : "Create a new academic/programme cycle."}</p>
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
                <label className={styles.formLabel}>Cycle Name</label>
                <input className={styles.formInput} placeholder="e.g. 2026/2027" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Start Year</label>
                  <input type="number" className={styles.formInput} placeholder="e.g. 2026" value={form.start_year} onChange={(e) => setForm((f) => ({ ...f, start_year: e.target.value }))} />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>End Year</label>
                  <input type="number" className={styles.formInput} placeholder="e.g. 2027" value={form.end_year} onChange={(e) => setForm((f) => ({ ...f, end_year: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button className={styles.submitBtn} onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 size={13} strokeWidth={2} className={styles.spin} /> Saving...</> : editingCycle ? "Save Changes" : "Create Cycle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
