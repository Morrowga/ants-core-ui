import { Outlet } from "react-router-dom";

import { AdminAuthProvider } from "@/features/admin/AdminAuthProvider";

/** Scopes AdminAuthProvider to ONLY the /internal-admin route branch --
 * App.tsx and the customer AuthContext are completely untouched. This is
 * the entire mechanism of isolation: nothing shared, nothing nested
 * inside the customer auth tree. */
export function AdminRoot() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );
}