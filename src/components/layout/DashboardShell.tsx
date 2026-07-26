import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "./Sidebar";

/**
 * Sidebar + content shell for every protected route. Also acts as the route
 * guard: unauthenticated visitors are sent to /login (with a return path).
 *
 * h-screen (not min-h-screen) + overflow-hidden on the outer wrapper, with
 * overflow-y-auto only on <main> -- this pins the sidebar to EXACTLY the
 * viewport height always, regardless of how much or little content is on
 * the page. min-h-screen alone doesn't guarantee this: it only sets a
 * floor, so the sidebar's height (100% of its parent) could end up shorter
 * than a full screen depending on how the surrounding layout resolves,
 * which is exactly the "sidebar stops short" bug being fixed here. Page
 * content that's taller than the viewport now scrolls inside <main> only
 * -- the sidebar itself never scrolls or shrinks.
 */
export function DashboardShell() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="flex h-screen items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Restoring your session…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto px-6 py-8 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}