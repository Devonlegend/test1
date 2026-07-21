import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ClipboardList,
  LogOut, X,
} from "lucide-react";
import styles from "./Sidebar.module.css";
import { logout } from "@/services";

// â”€â”€ NAV STRUCTURE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const navMain = [
  { label: "Overview",      href: "/verifier",              icon: LayoutDashboard, roles: ["verifier"] },
  { label: "Applications",  href: "/verifier/applications", icon: ClipboardList,   roles: ["verifier"] },
];

// â”€â”€ NAV ITEM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
      title={item.label}
    >
      <span className={styles.navIcon}>
        <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
      </span>
      <span className={styles.navLabel}>{item.label}</span>
    </Link>
  );
}

// â”€â”€ SIDEBAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function VerifierSidebar({ isOpen, onClose, user }) {
  const pathname = usePathname();

  function isActive(href) {
    if (href === "/verifier") return pathname === "/verifier";
    return pathname.startsWith(href);
  }

  const initials =
    (user?.firstname?.[0]?.toUpperCase() || "") +
    (user?.lastname?.[0]?.toUpperCase()  || "");

  const roleLabel =
    user?.role === "superadmin" ? "Super Admin" :
    user?.role === "verifier"   ? "Verifier"    :
    "Admin";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>

        {/* â”€â”€ LOGO â”€â”€ */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <span className={styles.logoLetter}>R</span>
          </div>
          <div className={styles.logoBrand}>
            <span className={styles.logoName}>RMHCDT</span>
            <span className={styles.logoSub}>Verifier Portal</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* â”€â”€ NAV â”€â”€ */}
        <nav className={styles.nav}>

          <span className={styles.sectionLabel}>Main</span>

          {navMain.filter(item => item.roles.includes(user?.role)).map((item) => (
            <NavItem key={item.href} item={item} active={isActive(item.href)} onClick={onClose} />
          ))}

        </nav>

        {/* â”€â”€ BOTTOM â”€â”€ */}
        <div className={styles.bottom}>

          {/* Static profile display */}
          <div className={styles.adminProfile}>
            <div className={styles.adminAvatar}>
              {initials || "AD"}
            </div>
            <div className={styles.adminInfo}>
              <span className={styles.adminName}>
                {user?.firstname} {user?.lastname}
              </span>
              <span className={styles.adminRole}>{roleLabel}</span>
            </div>
          </div>

          <div className={styles.divider} />

          {/* Sign out */}
          <button
            className={`${styles.navItem} ${styles.signOut}`}
            title="Sign out"
            onClick={async () => {
              try { await logout(); } catch {}
              window.location.href = "/login";
            }}
          >
            <span className={styles.navIcon}>
              <LogOut size={17} strokeWidth={1.8} />
            </span>
            <span className={styles.navLabel}>Sign out</span>
          </button>

        </div>

      </aside>
    </>
  );
}