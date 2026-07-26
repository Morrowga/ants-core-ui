import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AuthTokens } from "./types";

/**
 * Same backend as HR Dashboard. This file is meant to be behaviorally
 * identical to HR Dashboard's `api-client.ts` (access token held in memory,
 * refresh token rotated, 401 -> refresh -> retry-once interceptor).
 *
 * TODO: diff this against HR Dashboard's actual api-client.ts when the repo
 * is available and align any differences (refresh endpoint path, refresh
 * token storage, header names) — do not let the two apps drift.
 */

const REFRESH_TOKEN_KEY = "ants.refresh_token";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function storeTokens(tokens: AuthTokens) {
  setAccessToken(tokens.access_token);
  if (tokens.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  }
}

export function clearTokens() {
  setAccessToken(null);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ---- 401 -> refresh (with rotation) -> retry once ----

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;
  try {
    // Bare axios (not apiClient) so this call skips the interceptors.
    const { data } = await axios.post<AuthTokens>(
      `${apiClient.defaults.baseURL}/auth/refresh`,
      { refresh_token: refreshToken },
    );
    storeTokens(data); // rotation: server returns a new refresh token too
    return data.access_token;
  } catch {
    clearTokens();
    return null;
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isAuthCall = config?.url?.startsWith("/auth/");
    if (error.response?.status === 401 && config && !config._retried && !isAuthCall) {
      config._retried = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(config);
      }
      // Refresh failed — surface the 401; AuthContext will treat the
      // session as ended.
      window.dispatchEvent(new CustomEvent("ants:session-expired"));
    }
    return Promise.reject(error);
  },
);
