/**
 * Auth0 Post-Login Action — inject the app-owned tenant id into the access token.
 *
 * Source of truth for tenants is the TenantManagement service, which writes the
 * tenant id to the user's `app_metadata.tenant_id` (via the Management API) when a
 * tenant is provisioned. This Action copies that value into the custom claim the
 * backend resolves tenancy from (`JwtTenancyResolver`).
 *
 * Install: Auth0 Dashboard → Actions → Library → Build Custom → trigger "Login /
 * Post Login", paste this code, deploy, and add it to the Login flow.
 *
 * Notes:
 * - Do NOT hardcode tenant ids here anymore; the app owns them.
 * - A user with no tenant yet (pre-onboarding) simply gets no claim; the web app
 *   detects this (GET /tenantmanagement/v1/tenants/me → 404) and runs onboarding,
 *   after which a silent token refresh re-runs this Action with the claim present.
 * - Platform administrators (cross-tenant, e.g. to manage trials) are marked by
 *   setting `app_metadata.platform_admin = true` on the user in the Auth0
 *   dashboard; this Action copies it into the admin claim the backend authorizes
 *   admin endpoints on. Never expose a self-service path that sets this flag.
 */
exports.onExecutePostLogin = async (event, api) => {
  const tenantId =
    event.user.app_metadata && event.user.app_metadata.tenant_id;

  if (tenantId) {
    api.accessToken.setCustomClaim("https://kdvmanager.nl/tenant", tenantId);
  }

  const isPlatformAdmin =
    event.user.app_metadata && event.user.app_metadata.platform_admin === true;

  if (isPlatformAdmin) {
    api.accessToken.setCustomClaim("https://kdvmanager.nl/admin", true);
  }
};
