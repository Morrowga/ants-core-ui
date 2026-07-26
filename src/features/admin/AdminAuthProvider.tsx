import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { adminApi, adminErrorDetail } from "./admin-api-client";
import { AdminAuthContext, adminTokenStore, type AdminInfo } from "./admin-auth";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [booting, setBooting] = useState(true);

  // The admin token itself (not a separate refresh token) lives directly
  // in localStorage, so it survives a page reload on its own -- this just
  // re-fetches who it belongs to, so the UI can show the admin's name/email
  // again instead of a blank state until next login.
  useEffect(() => {
    const token = adminTokenStore.get();
    if (!token) { setBooting(false); return; }
    adminApi.get("/admin/auth/me")
      .then(({ data }) => setAdmin(data))
      .catch(() => adminTokenStore.clear())
      .finally(() => setBooting(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await adminApi.post("/admin/auth/login", { email, password });
      adminTokenStore.set(data.access_token);
      setAdmin(data.admin);
    } catch (e) {
      throw new Error(adminErrorDetail(e));
    }
  }, []);

  const logout = useCallback(() => {
    adminTokenStore.clear();
    setAdmin(null);
    window.location.assign("/internal-admin/login");
  }, []);

  const value = useMemo(() => ({ admin, login, logout }), [admin, login, logout]);

  if (booting) return null; // avoid a login flash while the session restores

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}