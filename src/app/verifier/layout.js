"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VerifierSidebar from "./components/VerifierSidebar";
import VerifierTopbar from "./components/VerifierTopbar";
import styles from "./components/Sidebar.module.css";
import { getMe } from "@/services/auth";

export default function VerifierLayout({ children }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadUser() {
      try {
        const res = await getMe();
        if (cancelled) return;

        const u = res.data;

        // Only allow verifier role
        if (u.role !== "verifier") {
          if (u.role === "admin" || u.role === "superadmin") {
            router.replace("/admin");
          } else {
            router.replace("/dashboard");
          }
          return;
        }

        setUser(u);
      } catch (err) {
        if (!cancelled) {
          router.replace("/login");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadUser();
    return () => { cancelled = true; };
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f8fafc" }}>
        <div style={{
          width: 28, height: 28,
          borderRadius: "50%",
          border: "2.5px solid #e2e8f0",
          borderTopColor: "#15803d",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={styles.layout}>
      <VerifierSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
      />
      <div className={styles.mainContent}>
        <VerifierTopbar
          onMenuOpen={() => setMenuOpen(true)}
          user={user}
        />
        <main className={styles.pageContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
