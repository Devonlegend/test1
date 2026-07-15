import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";
import AdminThemeProvider from "./admin/components/AdminThemeProvider";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm",
});

export const metadata = {
  title: "RMHCDT Youth Portal",
  description: "Royal Mbo Host Community Development Trust - Youth Beneficiary Portal for scholarships, grants, and empowerment programmes.",
  openGraph: {
    title: "RMHCDT Youth Portal",
    description: "Apply for scholarships, grants, and empowerment programmes from the Royal Mbo Host Community Development Trust.",
    type: "website",
    locale: "en_NG",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={sora.variable + " " + dmSans.variable}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <AdminThemeProvider>
          {children}
        </AdminThemeProvider>
      </body>
    </html>
  );
}