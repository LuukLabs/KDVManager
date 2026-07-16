import { executeFetch } from "../mutator/executeFetch";

/**
 * Platform-admin view of a tenant, served by the TenantManagement API
 * (`/tenantmanagement/v1/admin/*`). Hand-written (not orval-generated) because it
 * backs the cross-tenant admin surface rather than a feature resource. The
 * endpoints require the platform-admin claim; regular users get 403.
 */
export type AdminTenant = {
  id: string;
  name: string;
  /** Billing address used on invoices; null until an admin fills it in. */
  invoiceAddress: string | null;
  createdAt: string;
  trialStartDate: string;
  trialEndDate: string;
  daysRemaining: number;
  isExpired: boolean;
  /** True when the tenant has converted to a subscription (never expires). */
  isSubscribed: boolean;
};

export const adminTenantsQueryKey = ["admin-tenants"] as const;

/** All tenants with their trial state, newest first. */
export const listAdminTenants = (options?: RequestInit): Promise<AdminTenant[]> =>
  executeFetch<AdminTenant[]>(`/tenantmanagement/v1/admin/tenants`, {
    ...options,
    method: "GET",
  });

/**
 * Extends a tenant's trial by `days`, counted from the current trial end (or
 * from now when already expired). Returns the updated tenant.
 */
export const extendTenantTrial = (
  tenantId: string,
  days: number,
  options?: RequestInit,
): Promise<AdminTenant> =>
  executeFetch<AdminTenant>(`/tenantmanagement/v1/admin/tenants/${tenantId}/extend-trial`, {
    ...options,
    method: "POST",
    headers: { "content-type": "application/json", ...(options?.headers ?? {}) },
    body: JSON.stringify({ days }),
  });

/**
 * Converts a tenant to a subscription (`subscribed: true` — exempt from trial
 * expiry) or reverts it to trial (`false` — the regular expiry rules re-apply
 * to the unchanged trial dates). Returns the updated tenant.
 */
export const setTenantSubscription = (
  tenantId: string,
  subscribed: boolean,
  options?: RequestInit,
): Promise<AdminTenant> =>
  executeFetch<AdminTenant>(`/tenantmanagement/v1/admin/tenants/${tenantId}/subscription`, {
    ...options,
    method: "PUT",
    headers: { "content-type": "application/json", ...(options?.headers ?? {}) },
    body: JSON.stringify({ subscribed }),
  });

/** Changes a tenant's organization details. Returns the updated tenant. */
export const updateTenant = (
  tenantId: string,
  details: { name: string; invoiceAddress: string | null },
  options?: RequestInit,
): Promise<AdminTenant> =>
  executeFetch<AdminTenant>(`/tenantmanagement/v1/admin/tenants/${tenantId}`, {
    ...options,
    method: "PUT",
    headers: { "content-type": "application/json", ...(options?.headers ?? {}) },
    body: JSON.stringify(details),
  });

/**
 * Deletes a tenant. The backend publishes a tenant-deleted event so other
 * services drop the tenant from their read models.
 */
export const deleteTenant = (tenantId: string, options?: RequestInit): Promise<void> =>
  executeFetch<void>(`/tenantmanagement/v1/admin/tenants/${tenantId}`, {
    ...options,
    method: "DELETE",
  });
