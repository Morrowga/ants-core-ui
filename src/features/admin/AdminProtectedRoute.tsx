import { Navigate, Outlet } from "react-router-dom";

import { adminTokenStore } from "./admin-auth";

/** Checks for the admin token directly (not the `admin` state object,
 * which may still be booting/restoring) -- same pattern as checking
 * "is there a token at all" rather than waiting on a fully-populated
 * profile object. */
export function AdminProtectedRoute() {
  const token = adminTokenStore.get();
  if (!token) return <Navigate to="/internal-admin/login" replace />;
  return <Outlet />;
}