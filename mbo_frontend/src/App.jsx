import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AdminThemeProvider from "./app/admin/components/AdminThemeProvider";

import Landing from "./app/page";

import LoginPage from "./app/login/page";
import RegisterPage from "./app/register/page";
import ForgotPasswordPage from "./app/forgot-password/page";

import DashboardLayout from "./app/dashboard/layout";
import DashboardHome from "./app/dashboard/page";
import ProgrammesPage from "./app/dashboard/programmes/page";
import ApplyPage from "./app/dashboard/programmes/apply/page";
import MyApplicationsPage from "./app/dashboard/applications/page";
import ApplicationDetailPage from "./app/dashboard/applications/[id]/page";
import ProfilePage from "./app/dashboard/profile/page";
import SettingsPage from "./app/dashboard/settings/page";
import NotificationsPage from "./app/dashboard/notifications/page";
import HelpPage from "./app/dashboard/help/page";
import PolicyPage from "./app/dashboard/policy/page";

import AdminLayout from "./app/admin/layout";
import AdminHome from "./app/admin/page";
import AdminSchemesPage from "./app/admin/schemes/page";
import AdminSchemeNewPage from "./app/admin/schemes/new/page";
import AdminSchemeDetailPage from "./app/admin/schemes/[id]/page";
import AdminApplicationsPage from "./app/admin/applications/page";
import AdminApplicationNewPage from "./app/admin/applications/new/page";
import AdminApplicationDetailPage from "./app/admin/applications/[id]/page";
import AdminApplicationsBySchemePage from "./app/admin/applications/scheme/[schemeId]/page";
import AdminBeneficiariesPage from "./app/admin/beneficiaries/page";
import AdminStudentsPage from "./app/admin/students/page";
import AdminStudentDetailPage from "./app/admin/students/[id]/page";
import AdminCyclesPage from "./app/admin/cycles/page";
import AdminProvidersPage from "./app/admin/providers/page";
import AdminDisqualificationsPage from "./app/admin/disqualifications/page";
import AdminAuditLogPage from "./app/admin/audit-log/page";
import AdminSettingsPage from "./app/admin/settings/page";

import VerifierLayout from "./app/verifier/layout";
import VerifierHome from "./app/verifier/page";
import VerifierApplicationsPage from "./app/verifier/applications/page";
import VerifierApplicationDetailPage from "./app/verifier/applications/[id]/page";
import VerifierApplicationsBySchemePage from "./app/verifier/applications/scheme/[schemeId]/page";

/**
 * Scroll to top on every route change. Next.js did this implicitly via the
 * browser default for full-page navigations; in a React SPA we wire it up
 * explicitly so deep links don't inherit the previous scroll position.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Skip for in-page hash anchors (e.g. the landing page #about nav)
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AdminThemeProvider>
      <ScrollToTop />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Routes>
        {/* Public landing + auth routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Beneficiary dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="programmes" element={<ProgrammesPage />} />
          <Route path="programmes/apply" element={<ApplyPage />} />
          <Route path="applications" element={<MyApplicationsPage />} />
          <Route path="applications/:id" element={<ApplicationDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="policy" element={<PolicyPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="schemes" element={<AdminSchemesPage />} />
          <Route path="schemes/new" element={<AdminSchemeNewPage />} />
          <Route path="schemes/:id" element={<AdminSchemeDetailPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="applications/new" element={<AdminApplicationNewPage />} />
          <Route path="applications/:id" element={<AdminApplicationDetailPage />} />
          <Route
            path="applications/scheme/:schemeId"
            element={<AdminApplicationsBySchemePage />}
          />
          <Route path="beneficiaries" element={<AdminBeneficiariesPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="students/:id" element={<AdminStudentDetailPage />} />
          <Route path="cycles" element={<AdminCyclesPage />} />
          <Route path="providers" element={<AdminProvidersPage />} />
          <Route path="disqualifications" element={<AdminDisqualificationsPage />} />
          <Route path="audit-log" element={<AdminAuditLogPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Verifier */}
        <Route path="/verifier" element={<VerifierLayout />}>
          <Route index element={<VerifierHome />} />
          <Route path="applications" element={<VerifierApplicationsPage />} />
          <Route path="applications/:id" element={<VerifierApplicationDetailPage />} />
          <Route
            path="applications/scheme/:schemeId"
            element={<VerifierApplicationsBySchemePage />}
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminThemeProvider>
  );
}
