# Proposal: Multi-Tenancy for a CQRS .NET SaaS

**Status:** Draft for review
**Applies to:** CRM + Scheduling services, Shared kernel
**Author:** Architecture review

This proposal describes best-practice multi-tenancy for KDVManager given its
CQRS-style, clean-architecture .NET microservices, and lays out a concrete,
phased plan to get there. It builds on the isolation hardening already applied
(see `docs/multi-tenancy.md`).

---

## 1. Where we are today

| Aspect | Current state |
|---|---|
| Isolation model | Shared database, shared schema, `TenantId` discriminator column |
| Tenant identity | Auth0 access-token claim `https://kdvmanager.nl/tenant` |
| Enforcement | EF Core global query filters + `SaveChanges` stamping + fail-closed accessor |
| CQRS style | Hand-rolled command/query handlers invoked **directly** from endpoints/controllers (no MediatR, no pipeline) |
| Validation | FluentValidation instantiated inside each handler |
| Messaging | MassTransit/RabbitMQ, **direct `Publish`** (no transactional outbox), tenant carried as `TenantId` header |
| Tenant lifecycle | None — a tenant is just a GUID; no registry, onboarding, plan, or config |
| Tenant context | Scoped DI accessor; the background sync job mutates it in a loop |

The foundation is sound. The gaps below are what separate "works" from
"enterprise SaaS-grade."

---

## 2. Guiding principles

1. **Tenancy is a cross-cutting concern, not handler logic.** It must be
   enforced in one place (a pipeline), not re-implemented per handler.
2. **Defense in depth.** No single mechanism is trusted. Claim → pipeline guard
   → EF query filter → database RLS → automated isolation tests.
3. **Fail closed, always.** Absence of a tenant is an error, never "all tenants."
4. **Cross-tenant access is explicit and audited.** The only way to touch more
   than one tenant is to *deliberately* open a privileged scope.
5. **The write model owns the tenant; the read model filters by it.** This is
   the CQRS-specific expression of the discriminator pattern.
6. **Isolation model is a per-tenant runtime decision, not a code assumption.**
   Design so a tenant can graduate from pooled → siloed without rewrites.

---

## 3. Data isolation model & tenancy tiers

Three canonical SaaS isolation models (AWS SaaS Lens terminology):

| Model | Isolation | Cost / density | Ops | Fits |
|---|---|---|---|---|
| **Pooled** — shared DB + schema + `TenantId` | Logical (app/RLS) | Highest density, cheapest | Simple, single migration | Most tenants |
| **Bridge** — shared DB, schema-per-tenant | Stronger | Medium | Migration fan-out | Mid/large tenants |
| **Siloed** — DB-per-tenant | Physical | Lowest density | Provisioning + migration per tenant | Enterprise / regulated |

**Recommendation:** Stay **pooled** as the default (it fits a childcare-SaaS
economics profile), but introduce the seams now so a specific tenant can be
moved to **siloed** later without touching application code:

- Resolve the **connection string per tenant** from the tenant registry
  (§8) instead of a single `appsettings` value. For pooled tenants they all
  resolve to the same connection; a siloed tenant resolves to its own. The
  `DbContext` factory reads the resolved connection from the tenant context.
- Keep the `TenantId` column even in siloed DBs (belt-and-suspenders + trivial
  migration path back to pooled).

This "pluggable isolation" is the single most important enterprise design seam,
and it is cheap to add before there is data to migrate.

---

## 4. Tenant context: ambient + explicit scope

Replace the mutable scoped accessor with an **immutable ambient context** backed
by `AsyncLocal`, plus an **explicit scope** for the rare cross-tenant path.

```csharp
public interface ITenantContext
{
    Guid TenantId { get; }
    string? ConnectionString { get; }   // enables siloed tenants (§3)
    TenantTier Tier { get; }            // from the registry (§8)
}

public interface ITenantContextAccessor
{
    ITenantContext? Current { get; }               // throws if required and unset
    IDisposable BeginScope(ITenantContext context); // AsyncLocal push/pop
}
```

- HTTP: middleware resolves the tenant once and calls `BeginScope`.
- Messaging: the consume filter calls `BeginScope` from the `TenantId` header.
- **Background/batch jobs** (e.g. `ScheduleStatusSyncHostedService`): iterate
  tenants and `using (accessor.BeginScope(tenant))` per iteration — no shared
  mutation, correct under concurrency, auto-restored on dispose. This directly
  fixes the current "mutate `Current` in a loop" smell.

`AsyncLocal` (not scoped DI) is the correct primitive because it flows across
`await`, `Task.Run`, and parallel loops, and it makes the scope lifetime
explicit rather than tied to a DI container scope.

---

## 5. CQRS-specific patterns

### 5.1 Introduce a mediator/pipeline (the enabling change)

Today handlers are called directly, so every cross-cutting rule must be copied
into every handler. Adopt **MediatR** (or a lightweight in-house
`ICommandHandler`/behavior pipeline if you want zero dependencies). This gives a
single interception point for tenancy, validation, logging, transactions, and
outbox.

```
Request → [TenantGuardBehavior] → [ValidationBehavior] → [UnitOfWork/OutboxBehavior] → Handler
```

### 5.2 Tenant guard behavior (both commands and queries)

```csharp
public sealed class TenantGuardBehavior<TReq, TRes> : IPipelineBehavior<TReq, TRes>
{
    private readonly ITenantContextAccessor _tenant;
    public async Task<TRes> Handle(TReq request, RequestHandlerDelegate<TRes> next, CancellationToken ct)
    {
        // Fail closed: no ambient tenant ⇒ no tenant-scoped work permitted,
        // unless the request is explicitly marked cross-tenant (§5.4).
        if (request is not ICrossTenantRequest && _tenant.Current is null)
            throw new TenantRequiredException();
        return await next();
    }
}
```

Handlers stop caring about tenancy entirely — they never read or set `TenantId`.

### 5.3 Write side owns the tenant

- Commands and DTOs **never** contain a `TenantId` (prevents over-posting).
- `TenantId` is stamped exactly once, in `SaveChanges` (already done) — remove
  every hand-set `TenantId` from handlers (the hard-coded GUIDs are gone; the
  goal state is handlers that don't mention `TenantId` at all).
- **Validate cross-entity references against the tenant.** A command that
  references another aggregate (e.g. `AddSchedule` → `GroupId`, `ChildId`) must
  verify those ids resolve *inside the current tenant* via tenant-scoped
  repositories. Query filters stop cross-tenant *reads* but not the storing of a
  dangling cross-tenant reference.

### 5.4 Read side filters by tenant

- Global query filters remain the default (already in place).
- **`IgnoreQueryFilters()` is banned** except in a small, reviewed allow-list.
  Enforce with an architecture test (§11) that fails the build on new usages.
- Cross-tenant reads (admin dashboards, platform reports) use an explicit
  `ICrossTenantRequest` marker and run inside `BeginScope`-per-tenant or a
  dedicated privileged read model — never by silently dropping the filter.

### 5.5 Read models / projections

For expensive cross-aggregate queries (daily overview, print schedules),
consider **tenant-scoped denormalised read models** updated from domain events.
Each projection row carries `TenantId` and is filtered identically. This keeps
the query side fast and the isolation story uniform.

---

## 6. Defense in depth — database Row-Level Security (RLS)

Application-only isolation means one raw-SQL mistake = cross-tenant leak. Add a
**PostgreSQL RLS backstop** so the database refuses cross-tenant rows even if the
EF filter is bypassed:

```sql
ALTER TABLE "Children" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "Children"
  USING ("TenantId" = current_setting('app.tenant_id')::uuid);
```

Set the session variable per unit of work via a `DbConnection` interceptor:

```csharp
// SaveChanges/command open: SET app.tenant_id = @tenant  (or SET LOCAL in a tx)
```

RLS is transparent to EF, costs little on an indexed `TenantId`, and turns a
class of application bugs into "returns nothing" instead of "leaks everything."
Pair it with the index recommendations below.

**Indexing:** most tables filter by `TenantId` on every query but lack an index
on it (only `Child`, `ChildNumberSequence`, `EndMarkSettings` have one today).
Add `TenantId` as the **leading column** of the relevant indexes (e.g.
`(TenantId, StartDate)` on `Schedule`) — this serves both the query filter and
RLS.

---

## 7. Reliability: transactional outbox

Direct `IPublishEndpoint.Publish` after `SaveChanges` can lose events (DB commits,
broker publish fails) or emit phantom events (publish succeeds, commit rolls
back). In a multi-tenant system this produces **cross-service tenant drift**
(e.g. a child exists in CRM but never in Scheduling).

Adopt the **MassTransit EF Core outbox** so the event is written in the same
transaction as the data and delivered exactly-once:

```csharp
x.AddEntityFrameworkOutbox<ApplicationDbContext>(o =>
{
    o.UsePostgres();
    o.UseBusOutbox();
});
```

The tenant `TenantId` header is then set by the existing publish filter at
delivery time — keep that. This makes tenant propagation across services
reliable, which is the whole point of the message header.

---

## 8. Tenant registry & lifecycle (the missing enterprise piece)

Today a tenant is an opaque GUID minted by Auth0. Enterprise SaaS needs a
**tenant catalog** as a first-class concept:

- **Registry** (small dedicated service or a table owned by an `Admin`/`Identity`
  service): `TenantId`, name, status (`Provisioning`/`Active`/`Suspended`/`Offboarding`),
  tier/plan, isolation mode + connection string, region, feature flags, limits.
- **Onboarding workflow:** create tenant → provision storage (no-op for pooled;
  create DB + migrate for siloed) → seed defaults (groups, time slots) → create
  the Auth0 org/first admin → activate. Model it as a saga so it is resumable.
- **Offboarding:** suspend → export → hard-delete or crypto-shred. GDPR-relevant
  for childcare data.
- **Resolution:** middleware resolves the claim → looks up the registry →
  materialises the full `ITenantContext` (tier, connection, flags). A
  **suspended** tenant is rejected here, centrally.

The registry is what lets you charge, throttle, feature-gate, and physically
isolate tenants without scattering `if (tenant == …)` through the code.

---

## 9. Cross-cutting concerns

- **Caching:** every cache key **must** include `TenantId`. A tenant-agnostic key
  is a cross-tenant leak. Provide an `ITenantCacheKey` helper and forbid raw keys.
- **Noisy neighbour / rate limiting:** apply per-tenant rate limits and quotas
  (ASP.NET rate limiting middleware partitioned by `TenantId`) using limits from
  the registry tier. Prevents one tenant starving others in a pooled model.
- **Feature flags / config:** resolve per-tenant from the registry, not global
  config. Enables plan-based gating and staged rollouts.
- **Migrations:** pooled = one migration. When siloed tenants exist, run
  migrations as a fan-out step in the deploy pipeline over the registry's active
  siloed connections. Keep migrations tenant-agnostic (no data assumptions).
- **Background jobs:** always tenant-scoped via `BeginScope` (§4); never assume a
  single tenant.

---

## 10. Observability & audit

- Tenant is already tagged on traces/logs — keep it, and ensure `TenantId` is a
  **low-cardinality dimension** you can filter dashboards/SLOs by per tenant.
- Add a **tenant audit log** for privileged/cross-tenant operations (who ran a
  cross-tenant query, tenant lifecycle changes). Enterprise buyers expect this.
- Avoid putting **PII** (names, DOB) in logs/traces; `TenantId` is fine, child
  data is not.

---

## 11. Testing tenant isolation (make leaks a build failure)

- **Isolation integration tests:** seed data for tenant A and B; assert every
  query/command as B can never see or mutate A's rows. Run against a real
  Postgres (Testcontainers) so RLS + query filters are both exercised.
- **Architecture tests** (NetArchTest / Roslyn analyzer):
  - No `IgnoreQueryFilters()` outside the reviewed allow-list.
  - No command/DTO exposes a settable `TenantId`.
  - No raw SQL (`FromSqlRaw`/`ExecuteSqlRaw`) without a tenant predicate.
- **Contract test** on the message bus: a consumed message with no/invalid
  `TenantId` header fails closed (never processes under a default tenant).

---

## 12. Target architecture (summary)

```
                    Auth0 (org + tenant claim)
                             │  JWT
                    ┌────────▼─────────┐
                    │  Envoy gateway   │  (validates JWT)
                    └────────┬─────────┘
        ┌────────────────────┼─────────────────────┐
        ▼                    ▼                       ▼
   CRM service         Scheduling service      (future services)
   ─────────────       ──────────────────
   Middleware: resolve claim → Tenant Registry lookup → BeginScope(ITenantContext)
   MediatR pipeline:  TenantGuard → Validation → UnitOfWork+Outbox → Handler
   EF Core:           global query filters (read) + SaveChanges stamp (write)
   Postgres:          RLS policy on app.tenant_id  ← defense-in-depth backstop
   Messaging:         EF outbox → RabbitMQ, TenantId header → consume BeginScope
        │
        └── Tenant Registry (catalog, tier, connection, flags, lifecycle saga)
```

---

## 13. Phased roadmap

| Phase | Goal | Work | Risk |
|---|---|---|---|
| **0 — done** | Close known leaks | Remove hard-coded tenant GUIDs, fallback auth policy, fail-closed middleware, sync `SaveChanges` guard | Shipped |
| **1** | Enforce tenancy in one place | Introduce MediatR + `TenantGuardBehavior` + `ValidationBehavior`; handlers stop touching `TenantId`; add cross-entity reference validation | Medium (refactor) |
| **2** | Database backstop | Add `TenantId` indexes (leading col) + Postgres RLS + connection interceptor; architecture tests banning filter bypass | Low–Medium |
| **3** | Reliable propagation | MassTransit EF outbox in both services | Low |
| **4** | Ambient context | `AsyncLocal` `ITenantContext` + explicit `BeginScope`; fix background job + consume filter | Low |
| **5** | Tenant registry | Registry + resolution + onboarding/offboarding saga; suspended-tenant rejection | High (new capability) |
| **6** | SaaS operations | Per-tenant rate limits, tenant-scoped cache keys, feature flags, pluggable connection for siloed tenants | Medium |

Phases 1–4 harden what exists and are mostly internal refactors. Phases 5–6 add
the SaaS business capabilities (billing-tier gating, onboarding, physical
isolation) that enterprise customers require.

---

## 14. Key trade-offs

- **Pooled vs siloed:** pooled is cheaper and simpler; siloed is what regulated
  or large enterprise tenants demand. The registry + pluggable connection lets
  you offer *both* without a fork.
- **MediatR dependency:** adds a library and indirection, but removing duplicated
  cross-cutting logic (and guaranteeing it runs) is worth it in a system where a
  missed guard is a data breach. A hand-rolled decorator pipeline is an
  acceptable zero-dependency alternative.
- **RLS:** small runtime cost and an extra migration discipline, in exchange for
  turning a whole bug class from "silent leak" into "returns nothing." Strongly
  recommended for childcare PII.
