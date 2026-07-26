import { createBrowserRouter } from "react-router-dom";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ErrorPage } from "@/components/shared/ErrorPage";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { BillingOverviewPage } from "@/features/billing/BillingOverviewPage";
import { InvoiceHistoryPage } from "@/features/billing/InvoiceHistoryPage";
import { CompaniesListPage } from "@/features/companies/CompaniesListPage";
import { CreateCompanyPage } from "@/features/companies/CreateCompanyPage";
import { LandingPage } from "@/features/landing/LandingPage";
import { ModuleMarketplacePage } from "@/features/marketplace/ModuleMarketplacePage";
import { PlansPage } from "@/features/plans/PlansPage";
import { OrganizationSettingsPage } from "@/features/settings/OrganizationSettingsPage";

// Internal admin (platform staff only) -- moved here from HR Dashboard.
// Completely separate route branch, own auth, own layout, no shared
// state with the customer-facing routes above. See features/admin/*.
import { AdminRoot } from "@/features/admin/AdminRoot";
import { AdminProtectedRoute } from "@/features/admin/AdminProtectedRoute";
import { AdminLoginPage } from "@/features/admin/AdminLoginPage";
import { AdminShell } from "@/features/admin/AdminShell";
import { AdminOrganizationsPage } from "@/features/admin/AdminOrganizationsPage";
import { AdminOrganizationDetailPage } from "@/features/admin/AdminOrganizationDetailPage";
import { AdminTicketsPage } from "@/features/admin/AdminTicketsPage";

export const router = createBrowserRouter([
  // Public
  { path: "/", element: <LandingPage />, errorElement: <ErrorPage /> },
  { path: "/plans", element: <PlansPage />, errorElement: <ErrorPage /> },
  { path: "/register", element: <RegisterPage />, errorElement: <ErrorPage /> },
  { path: "/login", element: <LoginPage />, errorElement: <ErrorPage /> },

  // Protected (DashboardShell guards + lays out everything below)
  {
    element: <DashboardShell />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/companies", element: <CompaniesListPage /> },
      { path: "/companies/new", element: <CreateCompanyPage /> },
      { path: "/companies/:id/modules", element: <ModuleMarketplacePage /> },
      { path: "/billing", element: <BillingOverviewPage /> },
      { path: "/billing/invoices", element: <InvoiceHistoryPage /> },
      { path: "/settings", element: <OrganizationSettingsPage /> },
    ],
  },

  // ---------- Internal admin (platform staff only) ----------
  {
    path: "/internal-admin",
    element: <AdminRoot />,
    errorElement: <ErrorPage />,
    children: [
      { path: "login", element: <AdminLoginPage /> },
      {
        element: <AdminProtectedRoute />,
        children: [
          {
            element: <AdminShell />,
            children: [
              { path: "organizations", element: <AdminOrganizationsPage /> },
              { path: "organizations/:id", element: <AdminOrganizationDetailPage /> },
              { path: "tickets", element: <AdminTicketsPage /> },
            ],
          },
        ],
      },
    ],
  },
]);