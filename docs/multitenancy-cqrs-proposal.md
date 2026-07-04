# Multi-Tenancy & CQRS — Best Practices and Proposal for KDVManager

**Status:** Proposal
**Date:** 2026-07-04
**Scope:** CRM service, Scheduling service, Shared infrastructure, messaging, data layer, operations

---

## 1. Executive summary

KDVManager already implements the industry-standard baseline for a pooled multi-tenant SaaS in .NET: a shared database with a `TenantId` discriminator column, tenant resolution from a JWT claim, ambient tenant context via a scoped accessor, EF Core global query filters, automatic tenant stamping on save, and tenant propagation over MassTransit headers. This is the right model for the product's scale and is the same pattern used by Finbuckle.MultiTenant, the ABP framework, and Microsoft's SaaS reference architectures.

What is missing is **depth, not direction**:

1. **A single line of defense.** Tenant isolation currently rests entirely on EF query filters in application code. One `IgnoreQueryFilters()` call, one raw SQL query, or one forgotten filter on a new entity silently breaks isolation. PostgreSQL Row-Level Security should back it up (defense in depth).
2. **Cross-cutting concerns are hand-rolled per handler.** The CQRS layer has no pipeline: validation is invoked manually inside each command handler, handlers are registered one-by-one, and there is no transactional outbox — a command can commit state and then fail to publish its integration event (or vice versa).
3. **Fail-open seams in messaging and writes.** The MassTransit consume filter proceeds without a tenant when the header is missing; `SaveChangesAsync` silently *re-stamps* `TenantId` on modified entities instead of treating a mismatch as a fault.
4. **No tenant lifecycle.** Tenants exist only as claims in Auth0 tokens and as `Guid` values scattered through rows. There is no tenant catalog, onboarding/offboarding flow, per-tenant configuration, or GDPR export/erasure story.
5. **No isolation verification.** Nothing in CI proves that tenant A cannot read tenant B's data, or that every new entity gets a query filter.

This document describes the relevant best practices (§2), assesses the current implementation against them (§3), and proposes a target architecture with a phased, low-risk roadmap (§4–§6). The proposal deliberately **keeps the pooled single-database model** and hardens it, rather than moving to database-per-tenant — the operational cost of per-tenant databases is not justified at current scale, and the proposal keeps that door open for the future.

---

## 2. Best practices: multi-tenancy in .NET with CQRS

### 2.1 Choosing a data isolation model

| Model | Isolation | Cost/tenant | Ops complexity | When to use |
|---|---|---|---|---|
| **Pooled** — shared DB, shared schema, `TenantId` column | Logical (app + RLS) | Lowest | Low | Many small tenants, uniform workload — **KDVManager today** |
| Schema-per-tenant | Medium | Medium | High (N× migrations) | Rarely a sweet spot; migration fan-out hurts |
| Database-per-tenant | Physical | High | High (catalog, elastic pools) | Few large tenants, strict compliance, per-tenant restore/geo requirements |
| Hybrid | Mixed | Mixed | Highest | Pooled by default, premium tenants isolated |

Best practice for B2B SaaS with many small/medium tenants (childcare organizations fit exactly) is **pooled with defense in depth**, moving individual tenants out only when a contractual or scale reason appears. The key discipline that keeps the hybrid door open: *no code outside the persistence layer may assume all tenants share a connection string.*

### 2.2 The non-negotiables (any model, any framework)

1. **Resolve the tenant once, at the edge, from a trusted source.** A signed JWT claim (Auth0 custom claim / Organizations) — never from a URL segment, header, or request body that the client controls without verification.
2. **Ambient tenant context, immutable per unit of work.** One scoped `ITenancyContext` per HTTP request / message consume / job iteration. Handlers never receive or pass `tenantId` as a parameter — that invites confused-deputy bugs where a handler trusts a caller-supplied tenant.
3. **Fail closed.** No tenant ⇒ exception, not "no filter". Every seam (HTTP, message consume, background job) either establishes a tenant context or refuses to touch tenant-owned data.
4. **Defense in depth at the database.** App-level filters *and* PostgreSQL Row-Level Security, so a bug in one layer is contained by the other. RLS is the industry-recommended second layer for pooled PostgreSQL multi-tenancy.
5. **Tenant-aware everything that stores or partitions state:** cache keys, rate limiters, file/blob paths, search indexes, message headers, metrics/traces (already done here via `tenant.id` tags).
6. **Indexes lead with `TenantId`.** Every query is tenant-scoped, so composite indexes `(TenantId, …)` keep pooled tables fast and prevent cross-tenant index scans.
7. **Prove isolation continuously.** Integration tests that seed two tenants and assert invisibility both ways; architecture tests that fail the build when an entity lacks a tenant filter or when `IgnoreQueryFilters` appears outside an allow-listed file.

### 2.3 CQRS-specific practices

CQRS multiplies the number of places tenancy must hold: every command handler, query handler, event consumer, projection, and read model. The way to keep that tractable is to **enforce tenancy in the pipeline, not in handlers**:

- **Mediator + pipeline behaviors.** A `ValidationBehavior`, `TenantGuardBehavior` (marker-interface driven), `UnitOfWorkBehavior`, and `LoggingBehavior` wrap every command/query uniformly. Handlers contain only use-case logic. (MediatR is the classic choice; [martinothamar/Mediator](https://github.com/martinothamar/Mediator) is a source-generated, reflection-free alternative with the same programming model — relevant since MediatR became commercially licensed from v13.)
- **Commands and queries are tenant-implicit.** The tenant comes from ambient context; a command carrying a `TenantId` property is a smell (exception: explicit admin/system operations, which should be separate, audited command types).
- **Transactional outbox.** In an event-driven system, a command must atomically (a) commit its state change and (b) enqueue its integration events — MassTransit's EF Core outbox does both in one database transaction, and the tenant header must ride along in the outbox message.
- **Idempotent, tenant-scoped consumers.** Consumers establish tenant context *before* any handler logic, from a mandatory message header; a missing header is a poison message (dead-letter), never "process without filter".
- **Read models are tenant-stamped at projection time** and filtered identically to write models. If a separate read store is ever introduced (e.g. denormalized tables, ElasticSearch), the tenant key must be part of the document/row identity.
- **Cross-tenant work is explicit and fenced.** Background jobs that enumerate tenants (a legitimate need — see `ScheduleStatusService`) should use a dedicated, audited "tenant scope runner" abstraction rather than sprinkling `IgnoreQueryFilters()` and manual accessor mutation through business code.

### 2.4 SaaS / enterprise operational practices

- **Tenant catalog as a first-class aggregate:** id, name, status (provisioning / active / suspended / offboarding), plan, created date, data-residency hints. Everything else (Auth0 org, billing, feature flags) references it.
- **Onboarding is a saga:** create catalog entry → create Auth0 organization/roles → seed defaults (groups, settings) → activate. Offboarding is the reverse plus scheduled data erasure (GDPR Art. 17) with an export step (Art. 20).
- **Noisy-neighbor control:** ASP.NET Core `RateLimiter` partitioned by tenant at the gateway or per service; per-tenant concurrency caps on expensive endpoints (report generation, printing).
- **Per-tenant observability** (already present via activity tags and log scopes) extended with per-tenant usage metrics — the same counters later feed billing and capacity decisions.
- **Restore story for pooled data:** point-in-time restore of a whole pooled DB restores *everyone*; per-tenant recovery needs logical export (or, later, per-tenant isolation). At minimum: a tested `pg_dump --where`-style tenant export script.

---

## 3. Current state assessment

### 3.1 What is already right (keep as-is)

| Concern | Implementation | Verdict |
|---|---|---|
| Tenant source of truth | Auth0 JWT custom claim `https://kdvmanager.nl/tenant` (`JwtTenancyResolver`) | ✅ Trusted, signed source |
| Ambient context | `ITenancyContextAccessor` (scoped) + `TenancyMiddleware` per service | ✅ Right pattern |
| Fail-closed reads | `TenancyContextAccessor.Current` getter throws `TenantRequiredException` when unset | ✅ Good default |
| Query isolation | EF Core `HasQueryFilter(e => e.TenantId == accessor.Current.TenantId)` on every aggregate in both services | ✅ Standard first line of defense |
| Write stamping | `SaveChangesAsync` stamps `TenantId` on added entities | ✅ (with a fix, §3.2.2) |
| Event propagation | MassTransit publish/send/consume filters carrying a `TenantId` header | ✅ Right transport |
| Observability | `tenant.id` on `Activity`, log scopes, telemetry enrichers | ✅ Ahead of most codebases |
| Service isolation | CRM and Scheduling each own their DB; no cross-service joins; sync via events | ✅ Clean microservice tenancy |

The vertical-slice layout (`Application/Features/<Aggregate>/Commands|Queries/<UseCase>/`) is a good CQRS shape and should be preserved.

### 3.2 Gaps and risks

#### 3.2.1 Single line of defense (High)
Isolation exists only in EF query filters. `ScheduleStatusService.SyncAllChildrenStatusAsync` already uses `IgnoreQueryFilters()` and manual accessor mutation in business code — legitimate today, but it normalizes the pattern, and nothing guards raw SQL or future entities. **No PostgreSQL RLS.**

#### 3.2.2 Silent re-stamping on modify (High)
`ApplicationDbContext.SaveChangesAsync` (both services) sets `TenantId` on `Added` **and `Modified`** entities. If an entity from tenant A ever reaches a tenant-B scope (bug, cross-tenant job, detached entity attach), the save silently *reassigns* the row to tenant B instead of failing. Stamp on `Added`; **throw** on `Modified` mismatch.

#### 3.2.3 Fail-open messaging (High)
`MassTransitTenancyConsumeFilter` proceeds when the `TenantId` header is absent; the publish filter silently omits the header when no tenant is set. Downstream this surfaces as a lazy `TenantRequiredException` at best, and at worst a consumer that only touches non-filtered resources runs tenant-less. Missing header on a tenant-owned message should fault the message (retry → dead-letter).

#### 3.2.4 No outbox (High, correctness)
Handlers call `_publishEndpoint.Publish(...)` after `SaveChanges`-backed repository calls, without a shared transaction (e.g. `UpdateChildCommandHandler`). A crash between the two loses events; CRM and Scheduling drift apart per tenant. MassTransit's EF outbox solves this with the infrastructure already in place.

#### 3.2.5 Hand-rolled application pipeline (Medium)
Handlers are plain classes, registered individually in `ConfigureServices` (17 manual registrations in CRM alone), each duplicating validate-then-throw boilerplate. There is no seam where tenancy, validation, transactions, or logging can be enforced *for every use case* — which is exactly what pipeline behaviors are for in CQRS.

#### 3.2.6 Duplication & dead code (Medium)
- `IMustHaveTenant` is defined per service (`CRM.Domain.Interfaces`, Scheduling equivalent) instead of once in `KDVManager.Shared.Domain`.
- `TenancyExtensions.UseTenancy(...)` passes a `tenantClaimType` argument to a middleware whose constructor doesn't accept one — it would throw if ever called (services currently call `UseMiddleware<TenancyMiddleware>()` directly). The claim type is meanwhile hardcoded in `JwtTenancyResolver`.
- `ApplicationDbContextFactory` uses `Guid.Empty` as a design-time tenant — harmless but should be a clearly-named noop accessor.

#### 3.2.7 No tenant lifecycle (Medium, SaaS)
No tenant catalog, no onboarding/offboarding, no per-tenant settings home (`EndMarkSettings` is a start, but ad hoc), no export/erasure procedure, no per-tenant rate limiting.

#### 3.2.8 No isolation verification (Medium)
No tests assert cross-tenant invisibility; no architecture test forces new entities into the filter list (each new `DbSet` requires remembering a manual `HasQueryFilter` line).

#### 3.2.9 Primitive obsession (Low)
`TenantId` is a bare `Guid` everywhere. A `readonly record struct TenantId(Guid Value)` prevents the classic transposition bug (`new Foo(tenantId, childId)` vs `(childId, tenantId)`) at compile time. Worth adopting opportunistically, not as a big-bang rewrite.

---

## 4. Proposal — target architecture

### 4.1 Data layer: keep pooled, add RLS (defense in depth)

Enable Row-Level Security on every tenant-owned table and scope each pooled connection to the current tenant via a session variable. The app keeps its EF filters (fast, index-friendly, produce good plans); RLS catches whatever slips past them.

```sql
-- per tenant-owned table (one EF migration, generated from a helper)
ALTER TABLE "Children" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Children" FORCE ROW LEVEL SECURITY;  -- also binds table owner
CREATE POLICY tenant_isolation ON "Children"
    USING ("TenantId" = current_setting('app.tenant_id')::uuid);
```

```csharp
// Npgsql: set the tenant on every pooled connection checkout
// (DbContext interceptor; runs for HTTP requests, consumers, and jobs alike)
public class TenantConnectionInterceptor : DbConnectionInterceptor
{
    private readonly ITenancyContextAccessor _accessor;

    public override async Task ConnectionOpenedAsync(
        DbConnection connection, ConnectionEndEventData eventData,
        CancellationToken ct = default)
    {
        var tenantId = _accessor.Current!.TenantId; // throws if unset — fail closed
        await using var cmd = connection.CreateCommand();
        cmd.CommandText = "SELECT set_config('app.tenant_id', @tid, false)";
        var p = cmd.CreateParameter(); p.ParameterName = "tid";
        p.Value = tenantId.ToString(); cmd.Parameters.Add(p);
        await cmd.ExecuteNonQueryAsync(ct);
    }
}
```

Application/migration roles: the migrations job runs as a role with `BYPASSRLS` (or policies keyed to role); the runtime service account does **not**. Cross-tenant jobs (§4.4) run per-tenant inside the loop, so they need no bypass.

Also in this phase:
- **Indexes**: audit every index on tenant-owned tables to lead with `TenantId`; add `(TenantId, ChildNumber)` unique index style constraints for tenant-scoped uniqueness (e.g. child numbers, group names).
- **Fix write stamping** (§3.2.2):

```csharp
foreach (var entry in ChangeTracker.Entries<IMustHaveTenant>())
{
    var tenantId = _tenancyContextAccessor.Current!.TenantId;
    switch (entry.State)
    {
        case EntityState.Added:
            entry.Entity.TenantId = tenantId;
            break;
        case EntityState.Modified or EntityState.Deleted
            when entry.Entity.TenantId != tenantId:
            throw new CrossTenantWriteException(entry.Metadata.ClrType, tenantId);
    }
}
```

- **Convention over enumeration**: replace the per-entity `HasQueryFilter` lines with a model-finalizing convention that applies the filter to *every* entity implementing `IMustHaveTenant` (and an architecture test asserting every persisted entity implements it). New entities become tenant-safe by default instead of by memory.

### 4.2 Application layer: mediator pipeline for CQRS cross-cutting concerns

Introduce a mediator (recommendation: **martinothamar/Mediator**, source-generated, Apache-2.0, no runtime reflection; MediatR is equivalent if the commercial license is acceptable) and move cross-cutting concerns into ordered behaviors:

```
Request → Logging → TenantGuard → Validation → UnitOfWork(+Outbox) → Handler
```

```csharp
public interface ICommand<TResponse> : IRequest<TResponse>, ITenantScoped { }
public interface IQuery<TResponse>  : IRequest<TResponse>, ITenantScoped { }
// Escape hatch — rare, audited, never resolves ITenancyContext:
public interface ISystemCommand<TResponse> : IRequest<TResponse> { }

public sealed class TenantGuardBehavior<TReq, TRes> : IPipelineBehavior<TReq, TRes>
    where TReq : ITenantScoped
{
    private readonly ITenancyContextAccessor _accessor;
    public ValueTask<TRes> Handle(TReq request, MessageHandlerDelegate<TReq, TRes> next,
        CancellationToken ct)
    {
        _ = _accessor.Current!.TenantId; // throws TenantRequiredException if unset
        return next(request, ct);
    }
}

public sealed class ValidationBehavior<TReq, TRes>(IEnumerable<IValidator<TReq>> validators)
    : IPipelineBehavior<TReq, TRes> { /* run all validators, aggregate, throw */ }
```

Effects on existing code:
- Handlers shed their manual `validator.ValidateAsync` blocks and become pure use-case logic; validators are discovered by assembly scanning.
- The 17-line manual handler registration in each `ConfigureServices` collapses to one `AddMediator()` call.
- Commands stay tenant-implicit — **no `TenantId` properties on commands/queries**; the guard behavior plus ambient accessor covers it. Admin operations that genuinely act across tenants use `ISystemCommand` and are individually audited.
- Endpoints keep their current shape, calling `mediator.Send(command)` instead of a concrete handler.

### 4.3 Messaging: mandatory tenant envelope + transactional outbox

1. **Fail-closed consume filter** — missing header on tenant-scoped messages faults the message:

```csharp
public async Task Send(ConsumeContext<T> context, IPipe<ConsumeContext<T>> next)
{
    if (!context.Headers.TryGetHeader("TenantId", out var raw)
        || raw is not string s || !Guid.TryParse(s, out var tenantId))
        throw new TenantRequiredException(); // retry → dead-letter, never silent

    _accessor.Current = new StaticTenancyContext(tenantId);
    await next.Send(context);
}
```

2. **Transactional outbox** (MassTransit EF outbox) in both services, so state change + event publish commit atomically per tenant:

```csharp
services.AddMassTransit(x =>
{
    x.AddEntityFrameworkOutbox<ApplicationDbContext>(o =>
    {
        o.UsePostgres();
        o.UseBusOutbox();
    });
    // existing filters stay; publish filter stamps TenantId into outbox messages
});
```

3. Keep the publish/send filters, but make the publish filter **throw** (not skip) when publishing a tenant-scoped event without tenant context. System-level events, if ever needed, use an explicit marker interface.
4. Consumer side effects (e.g. Scheduling's `ChildAddedEvent` consumer) become idempotent per `(TenantId, ChildId, message id)` — the outbox's inbox feature provides exactly-once consume semantics.

### 4.4 Cross-tenant work: an explicit, fenced runner

Replace ad-hoc `IgnoreQueryFilters()` + accessor mutation (as in `ScheduleStatusService`) with one audited abstraction — the only sanctioned way to run cross-tenant:

```csharp
public interface ITenantScopeRunner
{
    /// Enumerates active tenants from the tenant catalog (not from data rows)
    /// and runs the action inside a fresh DI scope with tenant context set.
    Task ForEachTenantAsync(Func<IServiceProvider, CancellationToken, Task> action,
        CancellationToken ct);
}
```

Key differences from today: tenants are enumerated from the **tenant catalog** (§4.5), not `SELECT DISTINCT TenantId FROM Children` with filters ignored; each iteration gets a *fresh DI scope* (fresh `DbContext`, correct RLS session variable) instead of mutating the accessor on a shared scope; and `IgnoreQueryFilters` disappears from business code entirely (an architecture test then bans it outside this one file).

### 4.5 Tenant lifecycle: a minimal tenant catalog

Add a small **Tenancy service** (or, pragmatically, a module in CRM to start) owning the tenant aggregate:

```csharp
public class Tenant
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public TenantStatus Status { get; set; }   // Provisioning, Active, Suspended, Offboarding
    public string? Auth0OrganizationId { get; set; }
    public string Plan { get; set; } = "standard";
    public DateTimeOffset CreatedAt { get; set; }
}
```

- **Onboarding saga** (MassTransit state machine or a simple orchestrating command): create catalog row → create Auth0 organization + connection/roles → publish `TenantProvisionedEvent` → each service seeds its per-tenant defaults (default groups, `EndMarkSettings`, number sequences) in its own consumer → mark Active.
- **Suspension** short-circuits in `TenancyMiddleware` (tenant resolved but suspended ⇒ 403), giving billing/abuse handling a lever.
- **Offboarding**: export (per-tenant JSON/CSV dump per service — GDPR Art. 20), then a scheduled erasure job (`DELETE … WHERE TenantId = @t` per service — Art. 17), then catalog tombstone.
- The catalog is also what `ITenantScopeRunner` (§4.4) enumerates, and where per-tenant feature flags/plan limits live later.

### 4.6 Edge & platform hardening

- **Per-tenant rate limiting** with the built-in ASP.NET Core rate limiter, partitioned on the tenant claim (protects against a single noisy tenant starving others):

```csharp
builder.Services.AddRateLimiter(o =>
    o.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, Guid>(ctx =>
        RateLimitPartition.GetTokenBucketLimiter(
            ctx.User.GetTenantId(), _ => new TokenBucketRateLimiterOptions { /* per-plan */ })));
```

- **Tenant-aware caching rule:** any future `IMemoryCache`/Redis usage must embed the tenant id in the key — enforce via a small `ITenantCache` wrapper so the raw cache never appears in handlers.
- **Cleanup:** move `IMustHaveTenant` to `KDVManager.Shared.Domain`; fix or delete the broken `UseTenancy` overload and make the claim type a configuration constant next to `JwtTenancyResolver`; give the design-time factory an explicitly named `DesignTimeTenancyContextAccessor`.
- **`TenantId` value object** (`readonly record struct`) introduced in `Shared.Contracts` and adopted opportunistically, starting with new code and event contracts.

### 4.7 Testing & guardrails

1. **Isolation integration tests** (Testcontainers PostgreSQL, per service): seed tenant A and B; assert queries under A never return B's rows; assert an update to B's row under A's context throws; assert RLS blocks a raw `SELECT` without `app.tenant_id`.
2. **Architecture tests** (NetArchTest or plain reflection xunit):
   - every non-owned entity type in each `DbContext` model implements `IMustHaveTenant` and has a query filter;
   - `IgnoreQueryFilters` appears only in `TenantScopeRunner`;
   - no `ICommand`/`IQuery` type declares a `TenantId` property.
3. **Messaging tests** (MassTransit test harness): consuming a tenant-scoped event without a `TenantId` header faults; published events carry the header; outbox delivers after simulated crash-between-save-and-publish.
4. **E2E**: extend the existing Playwright suite's mock-auth server with a second tenant and one cross-tenant invisibility spec.

---

## 5. Phased roadmap

Ordered by risk-reduction per unit of effort; each phase ships independently.

**Phase 1 — Close the fail-open seams (days)**
Fix `SaveChangesAsync` re-stamping → throw on mismatch (§4.1); fail-closed consume/publish filters (§4.3.1/.3); query-filter-by-convention + shared `IMustHaveTenant`; delete dead `UseTenancy` overload; isolation integration tests + architecture tests (§4.7). *No behavior change for correct code; bugs become loud instead of silent.*

**Phase 2 — Defense in depth (days–week)**
PostgreSQL RLS policies via EF migration + `TenantConnectionInterceptor`; role split for migrations vs runtime; `TenantId`-leading index audit; tenant-scoped unique constraints.

**Phase 3 — CQRS pipeline & outbox (week)**
Introduce mediator + behaviors (TenantGuard, Validation, UnitOfWork) — mechanical handler migration, endpoints unchanged in shape; MassTransit EF outbox + inbox idempotency; `ITenantScopeRunner` replaces `IgnoreQueryFilters` in `ScheduleStatusService`.

**Phase 4 — Tenant lifecycle (week+)**
Tenant catalog + status middleware check; onboarding saga with per-service seeding consumers; per-tenant export & erasure jobs; suspension flow.

**Phase 5 — SaaS scale levers (as needed)**
Per-tenant rate limiting at Envoy or per service; per-tenant usage metrics → billing; per-plan feature flags from the catalog; evaluate hybrid isolation (dedicated DB for premium tenants) only when a concrete customer or scale trigger appears — Phases 1–4 keep that migration path open because no business code assumes a shared connection string.

---

## 6. Explicit non-goals / decisions

- **No database-per-tenant now.** Operational cost (migration fan-out, connection management, catalog/routing) outweighs benefits at current tenant count; RLS + pooled gives strong isolation for a fraction of the cost. Revisit per-tenant isolation as a *plan feature*, not a default.
- **No physically separate read store.** The current "same DB, separate query handlers" CQRS style is appropriate; projections/read replicas are a scale response, not an architecture requirement.
- **No tenant resolution from subdomain/path.** JWT claim (later: Auth0 Organizations) remains the single trusted source; the SPA and gateway never assert tenant identity themselves.
- **Keep vertical slices.** The `Features/<Aggregate>/Commands|Queries` layout stays; the mediator swap changes wiring, not structure.

---

## Appendix A — Current tenancy touchpoints (inventory)

| Area | File(s) |
|---|---|
| Contract | `src/Shared/KDVManager.Shared.Contracts/Tenancy/ITenancyContext.cs`, `TenantIdentifiers.cs` |
| Resolution | `src/Shared/KDVManager.Shared.Infrastructure/Tenancy/JwtTenancyResolver.cs`, `TenancyMiddleware.cs` |
| Ambient context | `TenancyContextAccessor.cs`, `StaticTenancyContext.cs`, `TenantRequiredException.cs` |
| Persistence | `src/Services/CRM/Infrastructure/ApplicationDbContext.cs`, `src/Services/Scheduling/Infrastructure/ApplicationDbContext.cs` (query filters + save stamping) |
| Messaging | `MassTransitTenancyConsumeFilter.cs`, `...PublishFilter.cs`, `...SendFilter.cs`; registration in each service's `Infrastructure/ConfigureServices.cs` |
| Cross-tenant job | `src/Services/Scheduling/Infrastructure/Services/ScheduleStatusService.cs` (uses `IgnoreQueryFilters` + manual accessor mutation) |
| Observability | `Tracing/TenantEnricherActivityProcessor.cs`, `Telemetry/TenantEnrichmentProcessor.cs` |
