import { LogOut } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { useAdminAuth } from "./admin-auth";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/internal-admin/organizations", label: "Organizations" },
  { to: "/internal-admin/tickets", label: "Support tickets" },
];

export function AdminShell() {
  const { admin, logout } = useAdminAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <p className="font-semibold tracking-tight">Ants — Internal</p>
            <nav className="flex gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-1.5 text-sm ${
                      isActive ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-200"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {admin && <span className="text-sm text-slate-400">{admin.full_name ?? admin.email}</span>}
            <Button variant="ghost" size="icon" onClick={logout} className="text-slate-400 hover:bg-slate-800 hover:text-slate-100">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}