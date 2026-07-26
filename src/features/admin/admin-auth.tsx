/**
 * Platform-admin auth -- deliberately separate from @/lib/auth (customer
 * auth). Lives inside features/admin/ entirely (not the shared @/lib
 * folder) since the whole point is that nothing about this system should
 * be mixed in with shared/customer-facing code. Different localStorage
 * key, different context, no shared state with the customer session at
 * all. An admin and a customer owner could even be logged in
 * simultaneously in two tabs without interfering with each other.
 */
import { createContext, useContext } from "react";

const ADMIN_TOKEN_KEY = "ants_internal_admin_token";

export interface AdminInfo {
  id: number;
  email: string;
  full_name: string | null;
}

export const adminTokenStore = {
  get: () => localStorage.getItem(ADMIN_TOKEN_KEY),
  set: (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token),
  clear: () => localStorage.removeItem(ADMIN_TOKEN_KEY),
};

interface AdminAuthValue {
  admin: AdminInfo | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function useAdminAuth(): AdminAuthValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}