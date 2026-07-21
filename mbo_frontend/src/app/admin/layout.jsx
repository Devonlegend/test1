import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";
import AdminTopbar from "./components/AdminTopbar";
import { getMe } from "@/services";
import styles from "./admin.module.css";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const router = useRouter();

  // â”€â”€ Load admin user on mount â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    let cancelled = false;
    async function loadUser() {
      try {
        const res = await getMe();
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
        // Not authenticated â€” send to login
        router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadUser();
    return () => { cancelled = true; };
  }, [router]);

  // Close sidebar when screen goes desktop width
  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 768) setSidebarOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // â”€â”€ Loading state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (loading) {
    return (
      <div className={styles.loadingShell}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  // â”€â”€ Shell â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className={styles.shell}>

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      {/* Main area â€” shifts right to account for collapsed sidebar */}
      <div className={styles.mainWrap}>
        <AdminTopbar
          user={user}
          onMenuOpen={() => setSidebarOpen(true)}
        />
        <main id="main-content" className={styles.content}>
          <Outlet />
        </main>
      </div>

    </div>
  );
}