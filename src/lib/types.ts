/**
 * Types mirroring the FastAPI backend described in the build spec.
 * Keep field names in sync with the backend's Pydantic schemas — drift
 * between these and the backend is what caused breakage earlier in the
 * project, so change them here only alongside a backend change.
 */

export type ModuleStatus =
  | "not_enabled"
  | "incomplete"
  | "trialing"
  | "active"
  | "cancelling"
  | "canceled";

export interface ModuleCatalogEntry {
  module_key: string;
  name: string;
  description: string;
  price_monthly_usd: number;
}

export interface CompanyModule {
  module_key: string;
  status: ModuleStatus;
  current_period_end: string | null; // ISO date
  auto_renew: boolean;
  seats_used: number;
}

export interface Company {
  id: number;
  organization_id: number;
  name: string;
  industry: string | null;
  timezone: string;
  currency?: string | null;
  working_hours_start?: string | null;
  working_hours_end?: string | null;
  workdays?: string[] | null;
  created_at: string;
  modules?: CompanyModule[];
}

export interface Organization {
  id: number;
  name: string;
  owner_email?: string;
}

export interface Invoice {
  number: string;
  created: number; // unix timestamp
  status: string;
  amount_paid: number | null;
  amount_due: number | null;
  currency?: string;
  invoice_pdf: string | null;
}

export interface PaymentMethodSummary {
  brand?: string;
  last4?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
}

export interface JwtClaims {
  sub: string;
  email?: string;
  organization_id?: number;
  // No longer always present right after registration -- an owner can now
  // exist with no Company yet (see RegisterPayload below), so this stays
  // undefined until they create their first Company via createCompany().
  company_id?: number;
  role?: string;
  exp: number;
}

/**
 * POST /auth/register now creates ONLY the Organization + owner_admin User
 * -- no Company, no CompanyModule row. company_name and timezone are
 * REMOVED from this type (not just made optional): they described the
 * auto-created Company's name/timezone, and there's no such Company
 * created at this step anymore for them to describe. The backend's
 * CompanyRegisterRequest still accepts both for backward compatibility,
 * but ignores them -- this frontend simply doesn't send them.
 *
 * A Company's name/timezone are now collected on the separate
 * "create your first company" screen (CreateCompanyPage.tsx), via
 * CompanyCreate/createCompany() instead.
 */
export interface RegisterPayload {
  organization_name: string;
  owner_email: string;
  owner_password: string;
  owner_full_name?: string;
}

/** POST /auth/register returns ONLY a token pair -- no company/organization
 *  object in the body. The newly created organization_id comes from
 *  DECODING the returned access token (see RegisterPage); company_id will
 *  be absent from that token until a Company is created afterward. */
export interface RegisterResponse extends AuthTokens {}