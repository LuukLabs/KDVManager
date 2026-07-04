# Multi-Tenancy Strategy & Isolation

KDVManager is a **shared-database, shared-schema** multi-tenant system. Every
tenant-owned row carries a non-nullable `TenantId` (GUID) discriminator column.
There is no per-tenant database or schema, and there is no database-level Row
Level Security — isolation is enforced entirely in the application layer.

## How a tenant is identified

1. Auth0 mints an access token containing the custom claim
   `https://kdvmanager.nl/tenant` (see `TenancyClaimTypes.TenantId`).
2. The Envoy gateway validates the JWT signature/issuer/audience and forwards it.
3. Each service **also** validates the JWT (`AddJwtBearer`) — it does not trust
   the gateway blindly.
4. `TenancyMiddleware` runs `JwtTenancyResolver`, which reads the tenant claim and
   sets the ambient `ITenancyContextAccessor.Current` for the request scope.

Middleware order is `UseAuthentication → UseAuthorization → TenancyMiddleware`,
so claims are populated before the tenant is resolved.

## How isolation is enforced

- **EF Core global query filters.** Every `IMustHaveTenant` entity has
  `HasQueryFilter(e => e.TenantId == accessor.Current!.TenantId)`. Every read is
  transparently scoped to the current tenant.
- **`SaveChanges` stamping.** Both `ApplicationDbContext`s override `SaveChanges`
  / `SaveChangesAsync` to stamp `TenantId` from the ambient tenant onto every
  **added or modified** tenant-owned entity.
- **Fail-closed accessor.** `TenancyContextAccessor.Current` *throws*
  `TenantRequiredException` when no tenant is set, so any query issued without a
  resolved tenant fails hard instead of leaking cross-tenant rows.
- **Cross-service propagation.** Tenant flows over RabbitMQ as the MassTransit
  message header `TenantId` (publish/send filters set it; the consume filter
  restores it into the ambient context).

## Hardening applied (this change)

| # | Area | Change |
|---|------|--------|
| 1 | Create handlers | Removed the hard-coded default tenant GUID (`7e520828-…`) from `AddChild` (CRM) and `AddGroup` / `AddTimeSlot` / `AddSchedule` (Scheduling). They now resolve the tenant from `ITenancyContextAccessor`, and `AddSchedule` also stamps child `ScheduleRule`s explicitly. |
| 2 | AuthN gate | Added a fallback authorization policy (`RequireAuthenticatedUser`) to both APIs so a request reaching a service directly (gateway bypass / SSRF) is rejected with 401 instead of running anonymously. Health checks and OpenAPI are explicitly `AllowAnonymous`. |
| 3 | Tenant gate | `TenancyMiddleware` now returns **403** when an *authenticated* request carries no tenant claim, rather than relying solely on a downstream 500. |
| 4 | Persistence | Both DbContexts now also override the **synchronous** `SaveChanges`, and Scheduling now re-stamps on **Modified** (previously Added only) — closing the gap where a wrongly-constructed entity could persist under the wrong tenant. |
| 5 | Message bus | The consume filter uses `Guid.TryParse` and fails closed on a malformed `TenantId` header instead of throwing; per-message tenant logging downgraded from `Information` to `Debug`. |
| 6 | Hygiene | Centralised the tenant claim type in `TenancyClaimTypes` (was a magic string). |

## Known residual risks / recommendations

- **No DB backstop.** Isolation is application-only. Any future raw SQL,
  `ExecuteUpdate/Delete`, Dapper, or `IgnoreQueryFilters()` usage bypasses it.
  Consider PostgreSQL Row Level Security keyed on a `SET app.tenant_id` session
  variable as a second layer, and add `TenantId` indexes (only `Child`,
  `ChildNumberSequence`, `EndMarkSettings` currently have one) for performance.
- **Broker trust.** Any actor able to publish directly to RabbitMQ with a chosen
  `TenantId` header can impersonate a tenant. Restrict broker access.
- **Cross-entity references.** `AddSchedule` does not verify that `GroupId` /
  `ChildId` belong to the caller's tenant. Query filters prevent *reading* another
  tenant's data, but a dangling cross-tenant reference can be stored. Consider
  validating referenced ids against tenant-scoped repositories.
- **The single intentional bypass** is `ScheduleStatusService.SyncAllChildrenStatusAsync`
  (a background hosted service) — verify it is never reachable from a request path.
