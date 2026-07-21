import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.divider} />
        <div className={styles.bottom}>
          {/* LEFT: Logo */}
          <Link href="/" className={styles.logo}>
            <img
              src="/mboyouths.png"
              alt="RMHCDT Youth Portal"
              className="h-8 w-8 rounded-full object-cover"
            />
          </Link>

          {/* RIGHT: Legal links + Copyright stacked */}
          <div className={styles.rightGroup}>
            <div className={styles.legal}>
              <a href="mailto:support@mboempowerment.com" className={styles.legalLink}>support@mboempowerment.com</a>
              <span className={styles.dot}>·</span>
              <Link href="#" className={styles.legalLink}>Privacy Policy</Link>
              <span className={styles.dot}>·</span>
              <Link href="#" className={styles.legalLink}>Terms of Use</Link>
            </div>
            <p className={styles.copyright}>© 2026 RMHCDT. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}