import { Building2, CreditCard, LogOut, ReceiptText, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import { BrandMark } from "@/components/shared/BrandMark";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { t } = useTranslation();
  const { logout, claims } = useAuth();
  const navigate = useNavigate();

  const NAV_ITEMS = [
    { to: "/companies", label: t("features.sidebar.nav.companies"), icon: Building2 },
    { to: "/billing", label: t("features.sidebar.nav.billing"), icon: CreditCard },
    { to: "/billing/invoices", label: t("features.sidebar.nav.invoices"), icon: ReceiptText },
    { to: "/settings", label: t("features.sidebar.nav.settings"), icon: Settings },
  ];

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-4 py-5">
        <BrandMark wordmark="ANTS Central" textClassName="text-sidebar-foreground" />
      </div>
      <nav className="flex-1 space-y-0.5 px-2" aria-label="Main">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/billing"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-active",
                isActive
                  ? "bg-sidebar-active/20 font-medium text-sidebar-foreground"
                  : "text-sidebar-muted hover:bg-sidebar-active/10 hover:text-sidebar-foreground",
              )
            }
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-sidebar-active/20 px-2 py-3">
        {claims?.email && (
          <p className="truncate px-3 pb-2 text-xs text-sidebar-muted" title={claims.email}>
            {claims.email}
          </p>
        )}
        {/* Language switcher, right above Log out -- only shows real
            options driven by what's registered in src/lib/i18n.ts (just
            English today), see LanguageSwitcher.tsx itself. */}
        <div className="px-1 pb-2">
          <LanguageSwitcher />
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-muted transition-colors hover:bg-sidebar-active/10 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-active"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          {t("common.logout")}
        </button>
      </div>
    </aside>
  );
}