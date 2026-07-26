import { jwtDecode } from "jwt-decode";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  apiClient,
  clearTokens,
  getAccessToken,
  getStoredRefreshToken,
  storeTokens,
} from "./api-client";
import type {
  AuthTokens,
  JwtClaims,
  RegisterPayload,
  RegisterResponse,
} from "./types";

interface AuthContextValue {
  /** Decoded claims from the current access token, or null when logged out. */
  claims: JwtClaims | null;
  isAuthenticated: boolean;
  /** True while we're attempting to restore a session on first load. */
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<JwtClaims>;
  register: (payload: RegisterPayload) => Promise<JwtClaims>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeClaims(token: string | null): JwtClaims | null {
  if (!token) return null;
  try {
    return jwtDecode<JwtClaims>(token);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [claims, setClaims] = useState<JwtClaims | null>(() =>
    decodeClaims(getAccessToken()),
  );
  const [isBootstrapping, setIsBootstrapping] = useState(
    () => !getAccessToken() && !!getStoredRefreshToken(),
  );

  // Restore a session on hard reload: access token lives only in memory, so
  // exchange the stored refresh token for a fresh pair.
  useEffect(() => {
    if (!isBootstrapping) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.post<AuthTokens>("/auth/refresh", {
          refresh_token: getStoredRefreshToken(),
        });
        storeTokens(data);
        if (!cancelled) setClaims(decodeClaims(data.access_token));
      } catch {
        clearTokens();
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isBootstrapping]);

  // When the interceptor gives up on refreshing, drop the session.
  useEffect(() => {
    const onExpired = () => setClaims(null);
    window.addEventListener("ants:session-expired", onExpired);
    return () => window.removeEventListener("ants:session-expired", onExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post<AuthTokens>("/auth/login", {
      email,
      password,
    });
    storeTokens(data);
    const nextClaims = decodeClaims(data.access_token);
    setClaims(nextClaims);
    if (!nextClaims) throw new Error("Login succeeded but the token could not be read.");
    return nextClaims;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    // POST /auth/register creates ONLY the Organization + owner_admin User
    // -- no Company, no CompanyModule row anymore. Returns a token pair;
    // organization_id comes from decoding it, same as login(). company_id
    // will be absent from the token until the owner creates their first
    // Company via createCompany() (see CreateCompanyPage.tsx).
    const { data } = await apiClient.post<RegisterResponse>("/auth/register", payload);
    storeTokens(data);
    const nextClaims = decodeClaims(data.access_token);
    setClaims(nextClaims);
    if (!nextClaims) throw new Error("Registration succeeded but the token could not be read.");
    return nextClaims;
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setClaims(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      claims,
      isAuthenticated: !!claims,
      isBootstrapping,
      login,
      register,
      logout,
    }),
    [claims, isBootstrapping, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}