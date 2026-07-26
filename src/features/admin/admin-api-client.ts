/**
 * Separate axios instance for the internal admin app -- never shares
 * headers, interceptors, or token storage with the customer @/lib/api-client.
 * Lives inside features/admin/ entirely, not the shared @/lib folder.
 *
 * Reads VITE_API_BASE_URL directly (same env var Core Dashboard's own
 * @/lib/api-client uses) rather than importing a shared API_BASE_URL
 * constant from it -- that constant doesn't exist in Core Dashboard's
 * api-client.ts (it only exports the pre-configured apiClient instance,
 * not a raw base URL string). Reading the env var directly here keeps
 * this file fully self-contained and not dependent on the shape of
 * customer-facing code it should otherwise never touch.
 *
 * Admin tokens are single, non-refreshing 12h tokens (see
 * app/core/admin_auth.py) -- simpler than the customer refresh-rotation
 * flow, since an internal staff member re-logging in once every 12h is a
 * non-issue, unlike interrupting a paying customer's session.
 */
import axios, { type AxiosError } from "axios";

import { adminTokenStore } from "./admin-auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const adminApi = axios.create({ baseURL: API_BASE_URL });

adminApi.interceptors.request.use((config) => {
  const token = adminTokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/admin/auth/")) {
      adminTokenStore.clear();
      window.location.assign("/internal-admin/login");
    }
    throw error;
  },
);

export function adminErrorDetail(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string") return detail;
    if (detail && typeof detail === "object") return JSON.stringify(detail);
  }
  return error instanceof Error ? error.message : "Something went wrong";
}