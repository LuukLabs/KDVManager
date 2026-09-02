# Auth0 configuration

Tenancy is **owned by the application** (the `TenantManagement` service), not by
Auth0. Auth0 only authenticates users and *carries* an app-minted tenant id on the
access token. This directory holds the Auth0 artifacts that must be configured in
the dashboard (they are kept here for source control / review).

## How it fits together

1. A new user signs in (no tenant yet). Their access token has **no** tenant claim.
2. The web app calls `GET /tenantmanagement/v1/tenants/me` → `404`, and shows the
   onboarding screen.
3. The user names their organization → `POST /tenantmanagement/v1/tenants`.
   `TenantManagement` creates the `Tenant` + owner `Membership`, then writes
   `app_metadata.tenant_id` on the Auth0 user via the **Management API**.
4. The web app forces a silent token refresh; the **post-login Action**
   (`actions/post-login-inject-tenant.js`) copies `app_metadata.tenant_id` into the
   `https://kdvmanager.nl/tenant` claim.
5. From then on every request carries the claim and tenancy resolves statelessly
   (`JwtTenancyResolver`) — unchanged hot path.

## 1. Machine-to-Machine app (Management API)

Create an Auth0 **Machine to Machine** application authorized for the
**Auth0 Management API** with scopes:

- `read:users`
- `update:users`

Provide its credentials to the `TenantManagement` service via configuration
(env vars shown; `__` maps to the config section separator):

| Config key                     | Env var                          |
| ------------------------------ | -------------------------------- |
| `Auth0:Domain`                 | `Auth0__Domain`                  |
| `Auth0:ManagementClientId`     | `Auth0__ManagementClientId`      |
| `Auth0:ManagementClientSecret` | `Auth0__ManagementClientSecret`  |

When `ManagementClientId`/`ManagementClientSecret` are **absent** (local dev, e2e),
the service uses a no-op provisioner: the tenant is still created in the database,
only the Auth0 write is skipped.

In Kubernetes these are wired from the optional secret `auth0-management-secret`
(see `deploy/k8s/applications/tenantmanagement/deployment.yml`).

## 2. Post-login Action

Install `actions/post-login-inject-tenant.js` as a Post-Login Action and add it to
the **Login** flow. Remove any older rule/action that hardcoded the tenant claim.

## 3. One-time backfill (existing tenants)

The trial/tenant feature is unreleased, so this is expected to be empty. If any
real tenants already exist (their id was previously injected by Auth0 directly):

1. For each, create a `Tenant` row (id = the existing tenant id) and an owner
   `Membership` (id = the user's `sub`) in the TenantManagement database.
2. Set `app_metadata.tenant_id` on each Auth0 user to that id.
3. Verify the Action injects the claim on next login.

## 4. Platform administrators (superadmin)

Platform admins can manage **all** tenants (list them, extend trials) via the
`/tenantmanagement/v1/admin/*` endpoints and the `/admin` page in the web app.
Authorization is claim-based; there is no separate login or user store.

To make a user a platform admin:

1. Auth0 Dashboard → User Management → Users → pick the user (e.g. yourself).
2. Edit **app_metadata** and add:

   ```json
   {
     "platform_admin": true
   }
   ```

3. On the user's next login (or silent token refresh) the post-login Action adds
   the `https://kdvmanager.nl/admin` claim to the access token, which unlocks the
   admin endpoints (`PlatformAdmin` authorization policy in TenantManagement) and
   shows the admin page link in the web app's account menu.

Remove the flag to revoke access. The flag is deliberately **not** writable via
any application endpoint — only via the Auth0 dashboard / Management API.
