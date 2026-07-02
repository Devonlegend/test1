"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VerifierSidebar from "./components/VerifierSidebar";
import VerifierTopbar from "./components/VerifierTopbar";
import styles from "./verifier.module.css";
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
      <div className={styles.loadingShell}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={styles.shell}>
      <VerifierSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
      />
      <div className={styles.mainWrap}>
        <VerifierTopbar
          onMenuOpen={() => setMenuOpen(true)}
          user={user}
        />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
