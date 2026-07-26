import { apiClient } from "./api-client";
import type {
  Company,
  CompanyModule,
  Invoice,
  ModuleCatalogEntry,
  PaymentMethodSummary,
} from "./types";

/** Flat-price module catalog (public — powers the pricing sections too). */
export async function getModuleCatalog(): Promise<ModuleCatalogEntry[]> {
  const { data } = await apiClient.get<ModuleCatalogEntry[]>("/billing/modules");
  return data;
}

/** This company's module rows. */
export async function getMyCompanyModules(): Promise<CompanyModule[]> {
  // NOTE: the backend scopes "me" from the JWT. If per-company scoping via a
  // header/param is added for multi-company orgs, thread the companyId from
  // the route in here — confirm the mechanism with the backend first.
  const { data } = await apiClient.get<CompanyModule[]>("/billing/companies/me/modules");
  return data;
}

export async function enableModule(moduleKey: string): Promise<CompanyModule> {
  // Explicit {} body, not omitted -- a request with literally zero bytes
  // was tripping up the backend's required-Pydantic-model body parameter
  // even though every field in it is individually optional. Belt and
  // suspenders alongside the backend's own default fix.
  const { data } = await apiClient.post<CompanyModule>(
    `/billing/modules/${moduleKey}/enable`,
    {},
  );
  return data;
}

export async function disableModule(moduleKey: string): Promise<CompanyModule> {
  const { data } = await apiClient.post<CompanyModule>(
    `/billing/modules/${moduleKey}/disable`,
  );
  return data;
}

export async function getInvoices(): Promise<Invoice[]> {
  const { data } = await apiClient.get<Invoice[]>("/billing/invoices");
  return data;
}

export async function getPaymentMethod(): Promise<PaymentMethodSummary> {
  const { data } = await apiClient.get<PaymentMethodSummary>("/billing/payment-method");
  return data;
}

/** Step 1 of adding/replacing a card, entirely in-dashboard via Stripe
 * Elements. Creates the Organization's Stripe customer lazily if this
 * is its very first card. */
export async function createSetupIntent(): Promise<{ client_secret: string }> {
  const { data } = await apiClient.post<{ client_secret: string }>("/billing/setup-intent");
  return data;
}

/** Step 2: called after stripe.confirmCardSetup() has already run
 * client-side (that's what actually handles 3DS/SCA if the card needs
 * it) -- this just attaches the resulting payment_method as the
 * customer's new default. */
export async function updatePaymentMethod(payload: {
  payment_method_id: string;
}): Promise<PaymentMethodSummary> {
  const { data } = await apiClient.patch<PaymentMethodSummary>(
    "/billing/payment-method",
    payload,
  );
  return data;
}

export async function getCompanies(): Promise<Company[]> {
  const { data } = await apiClient.get<Company[]>("/companies");
  return data;
}

// ---------------------------------------------------------------------------
// Organization-level endpoints -- create an additional Company, rename the
// Organization itself. Both require owner_admin on the backend.
// ---------------------------------------------------------------------------

export async function createCompany(
  organizationId: number,
  payload: {
    name: string;
    industry?: string;
    timezone: string;
    currency: string;
    working_hours_start: string;
    working_hours_end: string;
    workdays: string[];
  },
): Promise<Company> {
  const { data } = await apiClient.post<Company>(
    `/organizations/${organizationId}/companies`,
    payload,
  );
  return data;
}

/**
 * Was missing entirely — OrganizationSettingsPage had a save mutation
 * (updateOrganizationName below) but nothing to populate the name field
 * from on load, which is why the field always looked empty after saving.
 * Backend: GET /organizations/me, added alongside this.
 */
export async function getOrganization(): Promise<{ id: number; name: string }> {
  const { data } = await apiClient.get<{ id: number; name: string }>("/organizations/me");
  return data;
}

export async function updateOrganizationName(name: string): Promise<{ id: number; name: string }> {
  const { data } = await apiClient.patch<{ id: number; name: string }>("/organizations/me", {
    name,
  });
  return data;
}

/**
 * Backend: POST /auth/me/change-password, 204 on success. Verifies
 * current_password server-side before hashing/storing new_password.
 *
 * NOTE on scope (confirmed, not just assumed): this does NOT invalidate
 * refresh tokens already issued on other devices/sessions -- there is no
 * session denylist anywhere in this system yet (see auth.tsx's logout(),
 * which has the same limitation). Changing your password here only stops
 * future logins with the old one; it doesn't kill other active sessions.
 * That's an accepted, existing gap, not something this call is supposed
 * to fix -- revisit only if/when real session invalidation gets built.
 */
export async function changePassword(payload: {
  current_password: string;
  new_password: string;
}): Promise<void> {
  await apiClient.post("/auth/me/change-password", payload);
}

/**
 * Backend: POST /auth/sso/issue-code. Requires the caller to already be
 * logged in here -- that's the entire trust basis for the handoff: Core
 * Dashboard vouches for someone it already authenticated. Returns a
 * single-use code good for ~30 seconds; the caller must redirect to the
 * target module with it immediately; don't hold onto or reuse this value.
 */
export async function issueSsoCode(): Promise<{ code: string; expires_in: number }> {
  const { data } = await apiClient.post<{ code: string; expires_in: number }>(
    "/auth/sso/issue-code",
  );
  return data;
}