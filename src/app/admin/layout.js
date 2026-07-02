"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";
import AdminTopbar from "./components/AdminTopbar";
import { getMe } from "@/services";
import styles from "./admin.module.css";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const router = useRouter();

  // ── Load admin user on mount ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function loadUser() {
      // ── Retry helper with exponential backoff ────────────────────────────
      async function retryGetMe(maxRetries = 2) {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            const res = await getMe();
            return res;
          } catch (err) {
            if (attempt === maxRetries) throw err;
            await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
          }
        }
      }

      try {
        const res = await retryGetMe();
        if (cancelled) return;

        const u = res.data;

        // Only allow admin and superadmin roles
        if (u.role !== "admin" && u.role !== "superadmin") {
          if (u.role === "verifier") {
            router.replace("/verifier");
          } else {
            router.replace("/dashboard");
          }
          return;
        }

        setUser(u);
      } catch {
        // Not authenticated — send to login
        router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadUser();
    return () => { cancelled = true; };
  }, []);

  // Close sidebar when screen goes desktop width
  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 768) setSidebarOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.loadingShell}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  // ── Shell ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.shell}>

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      {/* Main area — shifts right to account for collapsed sidebar */}
      <div className={styles.mainWrap}>
        <AdminTopbar
          user={user}
          onMenuOpen={() => setSidebarOpen(true)}
        />
        <main className={styles.content}>
          {children}
        </main>
      </div>

    </div>
  );
}