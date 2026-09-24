import { executeFetch } from "../mutator/executeFetch";
import { ApiError } from "../errors/types";

/**
 * Tenant (organization) of the current user, owned by the TenantManagement API
 * (`/tenantmanagement/v1/tenants`). Hand-written (not orval-generated) because it
 * backs cross-cutting onboarding/tenancy rather than a feature resource.
 */
export type MyTenant = {
  id: string;
  name: string;
  /** TenantRole enum: 0 = Owner, 1 = Admin, 2 = Member. */
  role: number;
  trialStartDate: string;
};

export const myTenantQueryKey = ["my-tenant"] as const;

/**
 * Returns the current user's tenant, or `null` when they have none yet (the API
 * answers 404), which signals that onboarding is required.
 */
export const getMyTenant = async (options?: RequestInit): Promise<MyTenant | null> => {
  try {
    return await executeFetch<MyTenant>(`/tenantmanagement/v1/tenants/me`, {
      ...options,
      method: "GET",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
};

/** Provisions a tenant for the current user and starts the trial. */
export const provisionTenant = (name: string, options?: RequestInit): Promise<MyTenant> =>
  executeFetch<MyTenant>(`/tenantmanagement/v1/tenants`, {
    ...options,
    method: "POST",
    headers: { "content-type": "application/json", ...(options?.headers ?? {}) },
    body: JSON.stringify({ name }),
  });
