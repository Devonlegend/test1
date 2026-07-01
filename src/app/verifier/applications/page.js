"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList, AlertCircle, CheckCircle2,
  GraduationCap, Briefcase, Banknote, ArrowRight,
} from "lucide-react";
import styles from "./page.module.css";
import { getSchemeOverview } from "@/services";

// ── CATEGORY CONFIG ───────────────────────────────────────────────────────────
const categoryConfig = {
  scholarship: { label: "Scholarship", color: "#15803d", bg: "#f0fdf4", icon: GraduationCap },
  empowerment: { label: "Empowerment", color: "#b45309", bg: "#fffbeb", icon: Briefcase },
  grant:       { label: "Grant",       color: "#7e22ce", bg: "#faf5ff", icon: Banknote },
};

const POLL_INTERVAL = 30_000; // 30 seconds

// ── SKELETON CARD ──────────────────────────────────────────────────────────────
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
export default function VerifierApplicationsPage() {
  const router = useRouter();

  const [schemes, setSchemes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // ── FETCH SCHEMES ─────────────────────────────────────────────────────────
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

  // Initial fetch + 30s polling
  useEffect(() => {
    fetchSchemes();
    const id = setInterval(() => fetchSchemes(true), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchSchemes]);

  // Re-fetch on window focus (returning from a review page)
  useEffect(() => {
    function onFocus() { fetchSchemes(true); }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchSchemes]);

  // ── DERIVED TOTALS ────────────────────────────────────────────────────────
  const totalPending  = schemes.reduce((s, d) => s + d.pending_review, 0);
  const totalUnpublished = schemes.reduce((s, d) => s + d.unpublished, 0);

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
            <p className={styles.sub}>Select a scheme to review its applications.</p>
          </div>
        </div>
      </div>

      {/* SUMMARY STRIP */}
      <div className={styles.summaryStrip}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue} style={{ color: "#0f172a" }}>
            {loading ? "—" : schemes.length}
          </span>
          <span className={styles.summaryLabel}>Schemes</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue} style={{ color: "#f59e0b" }}>
            {loading ? "—" : totalPending}
          </span>
          <span className={styles.summaryLabel}>Pending Review</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue} style={{ color: "#15803d" }}>
            {loading ? "—" : totalUnpublished}
          </span>
          <span className={styles.summaryLabel}>Unpublished</span>
        </div>
      </div>

      {/* ERROR */}
      {error && !loading && (
        <div className={styles.emptyState}>
          <AlertCircle size={28} color="#f87171" strokeWidth={1.5} />
          <p style={{ color: "#ef4444", fontWeight: 600 }}>{error}</p>
          <button className={styles.retryBtn} onClick={() => { setError(null); setLoading(true); fetchSchemes(); }}>
            Try again
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading && !error && (
        <div className={styles.cardGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* SCHEME CARDS GRID */}
      {!loading && !error && schemes.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap} style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
            <CheckCircle2 size={24} color="#15803d" strokeWidth={1.8} />
          </div>
          <p className={styles.emptyTitle}>No schemes yet</p>
          <p className={styles.emptySub}>Applications will appear here once schemes are created.</p>
        </div>
      )}

      {!loading && !error && schemes.length > 0 && (
        <div className={styles.cardGrid}>
          {schemes.map((entry) => {
            const s = entry.scheme;
            const cat = categoryConfig[s.award_type] || categoryConfig.scholarship;
            const Icon = cat.icon;
            const hasPending = entry.pending_review > 0;
            const hasUnpublished = entry.unpublished > 0;

            return (
              <button
                key={s.id}
                className={`${styles.schemeCard} ${hasPending ? styles.schemeCardActive : ""}`}
                onClick={() => router.push(`/verifier/applications/scheme/${s.id}`)}
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
                    <span
                      className={styles.cardChip}
                      style={{ color: cat.color, background: cat.bg }}
                    >
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
                  {hasUnpublished > 0 && (
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
    </div>
  );
}
