# KDVManager — Application Security Review

**Date:** 2026-07-02
**Scope:** Full application — CRM & Scheduling .NET microservices, shared infrastructure libraries, React/Vite web frontend, Envoy API gateway, Kubernetes/ArgoCD deployment, GitHub Actions CI/CD, Dockerfiles, and secret management.
**Method:** Manual source review of authentication, multi-tenant isolation, data access, input handling, error handling, CI/CD, container and cluster configuration. No dynamic testing was performed (no running environment); findings are code/config-based and, where a behavior was in doubt, verified against upstream documentation.

---

## Executive summary

KDVManager is a multi-tenant SaaS. Tenancy is derived from a signed Auth0 JWT claim (`https://kdvmanager.nl/tenant`) and enforced with EF Core global query filters — a sound design. The Envoy gateway validates JWTs at the edge, production secrets are sealed, and the CRM/Scheduling pods are well hardened.

However, the review found one **high-impact tenant-isolation bypass**: the generic repository fetches entities with `DbContext.Find`/`FindAsync`, which **does not apply EF Core global query filters**, so "get / update / delete by id" operations reach across tenants. This is the single most important issue and should be fixed first.

Secondary themes: authorization is enforced only at the gateway (no in-service `[Authorize]`/fallback policy), a CI workflow exposes a long-lived token to PR-authored build code, unhandled errors leak exception messages, and several defense-in-depth gaps exist in the cluster network and container config.

### Findings by severity

| # | Severity | Finding | Area |
|---|----------|---------|------|
| 1 | **High** | Cross-tenant IDOR: `FindAsync` bypasses global query filters | Backend / tenancy |
| 2 | **High** | `NUGET_GITHUB_TOKEN` exposed to PR-triggered Docker builds | CI/CD |
| 3 | **Medium** | No in-service authorization (no `[Authorize]` / fallback policy) | Backend / authz |
| 4 | **Medium** | Unhandled 500 returns raw `exception.Message` to client | Backend |
| 5 | **Medium** | Hardcoded tenant GUID in `AddChild` write path | Backend |
| 6 | **Medium** | NuGet token in Docker build `ARG` persisted to GHA cache | CI/CD |
| 7 | **Medium** | Third-party GitHub Actions pinned to mutable tags | CI/CD |
| 8 | **Medium** | `curl … | bash` of installer from mutable branch in write-scoped job | CI/CD |
| 9 | **Medium** | `web` and `rabbitmq` pods have no `securityContext` | K8s |
| 10 | **Medium** | Envoy admin API bound to `0.0.0.0:8001` | K8s |
| 11 | **Medium** | No NetworkPolicies (flat cluster network) | K8s |
| 12 | **Medium** | App connects to Postgres as `doadmin` (superuser) | K8s / DB |
| 13 | **Medium** | CSP allows `unsafe-inline` + `unsafe-eval` in `script-src` | Frontend |
| 14 | **Medium** | CSP Auth0 domain likely mismatches configured tenant | Frontend |
| 15 | **Low** | Permissive gateway CORS (`allow_origin` regex `.*`) | Gateway |
| 16 | **Low** | Scheduling API exposes Swagger UI in production | Backend |
| 17 | **Low** | Placeholder credentials + `AllowedHosts: *` in committed `appsettings.json` | Backend |
| 18 | **Low** | Dev cert password committed in `docker-compose.override.yml` | Repo hygiene |
| 19 | **Low** | Runtime Docker images set no non-root `USER` | Docker |
| 20 | **Low** | Mutable image tags (`linux-main`, `:latest`-style) in manifests | K8s |
| 21 | **Low** | `returnTo` redirect value not validated (open-redirect latent) | Frontend |
| 22 | **Low** | Verbose auth-flow `console.log` in production bundle | Frontend |
| 23 | **Low** | Missing range validation on report queries (`year`/`month`) → 500 | Backend |
| 24 | **Low** | `PageNumber` not clamped (negative offset → DB error) | Backend |
| 25 | **Low** | ArgoCD apps use unrestricted `default` project + self-heal | K8s |
| 26 | **Info** | Unescaped `%`/`_` LIKE wildcards in search (tenant-scoped) | Backend |

---

## High severity

### 1. Cross-tenant IDOR — `FindAsync` bypasses EF Core global query filters
**Severity: High** (tenant isolation bypass)
**Files:**
- `src/Services/CRM/Infrastructure/Repositories/BaseRepository.cs:36` (`GetByIdAsync` → `FindAsync`), `:62` (`ExistsAsync` → `FindAsync`)
- `src/Services/Scheduling/Infrastructure/Repositories/BaseRepository.cs:34`, `:50`

Multi-tenant isolation relies on EF Core global query filters (`ApplicationDbContext.OnModelCreating`: `HasQueryFilter(a => a.TenantId == _tenancyContextAccessor.Current!.TenantId)`). These filters apply to LINQ queries (`Where`, `FirstOrDefaultAsync`, `ToListAsync`) — so **list and search endpoints are correctly tenant-scoped**.

But the generic repository resolves single entities with `DbContext.Set<T>().FindAsync(id)`. Per EF Core, **`Find`/`FindAsync` do not apply global query filters** — they are primary-key lookups, not LINQ queries, and cannot even be combined with `IgnoreQueryFilters` (confirmed in EF Core docs and issue [dotnet/efcore#9405](https://github.com/aspnet/EntityFramework/issues/9405)). Consequently any handler that fetches an entity by GUID and then acts on it operates **across tenant boundaries**.

Affected handlers (fetch-by-id then read/update/delete):
- CRM: `DeleteChildCommandHandler.cs:23`, `UpdateChildCommandHandler.cs:23`, `LinkGuardianToChildCommandHandler.cs:26,32`, `GetGuardianChildrenQueryHandler.cs:29`
- Scheduling: `DeleteScheduleCommandHandler.cs:28`, `DeleteGroupCommandHandler.cs:22`, `DeleteClosurePeriodCommandHandler.cs:16`, `DeleteChildAbsenceCommandHandler.cs:17`, `DeleteEndMarkCommandHandler.cs:28`, `UpdateTimeSlotCommandHandler.cs:24`, `Children/UpdateChildCommandHandler.cs:19`, `Children/DeleteChildCommandHandler.cs:21`, `DeleteTimeSlotCommandHandler.cs` (via `ExistsAsync`)

**Impact:** An authenticated user in tenant A who knows/guesses a resource GUID belonging to tenant B can read, modify, or delete it. GUIDs are not a security boundary — IDs leak via logs, exports, referrers, and prior access. **Worse on CRM:** `ApplicationDbContext.SaveChangesAsync` stamps `TenantId` on `EntityState.Modified` as well as `Added`, so *updating* another tenant's `Child` **reassigns that record to the attacker's tenant** — silent cross-tenant data theft/corruption.

Note the safe pattern already exists in the codebase: `ChildRepository.GetByIdWithIntervalsAsync` uses `FirstOrDefaultAsync(c => c.Id == id)`, which **does** apply the tenant filter. The generic `BaseRepository` is the inconsistent, unsafe path.

**Remediation:**
- Replace `FindAsync(id)` in both `BaseRepository` implementations with a filtered query: `await _dbContext.Set<T>().FirstOrDefaultAsync(e => EF.Property<Guid>(e, "Id") == id)` (or a constrained `where T : IHasId` overload using `e.Id`). This makes the global query filter apply.
- Same fix for `ExistsAsync` (use `AnyAsync`).
- Add a regression test: create two tenants, insert a record under tenant A, assert `GetByIdAsync`/`DeleteAsync`/`UpdateAsync` return not-found/no-op under tenant B.

### 2. `NUGET_GITHUB_TOKEN` exposed to PR-triggered Docker builds
**Severity: High** (CI/CD secret exposure / supply chain)
**Files:** `.github/workflows/e2e.yml:5-13` (triggers on `pull_request`), `:35` (`NUGET_GITHUB_TOKEN: ${{ secrets.NUGET_GITHUB_TOKEN }}`) used in `docker buildx bake` at `:37-43`.

`e2e.yml` runs on `pull_request` and builds **PR-authored code** (Dockerfiles + build context) with a long-lived custom PAT (`NUGET_GITHUB_TOKEN`) in the environment. A pull request from a branch in the same repository (where GitHub forwards secrets — unlike fork PRs, which do not) can modify the Dockerfile/build to exfiltrate the token. Because the token is a persistent PAT (not the auto-expiring `GITHUB_TOKEN`), the blast radius is larger.

(By contrast, `scheduling-api.yml:47` passes the ephemeral `secrets.GITHUB_TOKEN` in its PR path — lower risk — and only uses the PAT in the non-PR push path at `:68`.)

**Remediation:** Do not expose the PAT to PR-triggered builds. Perform authenticated NuGet restore in a trusted push-only job, or gate the secret behind a GitHub Environment requiring reviewer approval. Prefer BuildKit secrets (`RUN --mount=type=secret,id=nuget_token`) over env/ARG so the token never enters a layer or cache. Rotate the token.

---

## Medium severity

### 3. No authorization enforced inside the services
**Files:** `src/Services/CRM/Api/ConfigureServices.cs:79-86`, `Program.cs:29-39`; `src/Services/Scheduling/Api/ConfigureServices.cs` (JWT setup), `Program.cs`; all endpoints in `Endpoints/*.cs` and `Controllers/*.cs`.

A repo-wide search finds **no** `[Authorize]`, `.RequireAuthorization()`, `AllowAnonymous`, or `FallbackPolicy` in either service. `UseAuthentication()`/`UseAuthorization()` are registered, but with no endpoint requirement and no fallback policy, the authorization middleware never rejects unauthenticated or under-scoped requests. Today the edge Envoy `jwt_authn` filter blocks anonymous traffic, and unauthenticated requests that slip through fail late (tenant accessor throws) — but **access control is an accidental side effect, not an enforced gate**. Any valid token for audience `https://api.kdvmanager.nl/` grants full CRUD within its tenant regardless of scope/role, and any future endpoint that doesn't touch a tenant-filtered query would be fully anonymous. If a service is ever reachable directly (in-cluster, SSRF, gateway bug — see #11), it is unprotected.

**Remediation:** Add a global fallback policy and require it:
```csharp
services.AddAuthorization(o => o.FallbackPolicy =
    new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .RequireClaim("https://kdvmanager.nl/tenant")
        .Build());
```
Explicitly `.AllowAnonymous()` on `/healthz` and dev OpenAPI. Add per-endpoint scope/permission checks where relevant.

### 4. Unhandled exceptions leak `exception.Message` to clients
**Files:** `src/Services/CRM/Api/Middleware/ExceptionHandlerMiddleware.cs` (final `result == string.Empty` block serializes `error = exception.Message`); `src/Services/Scheduling/Api/Middleware/ExceptionHandlerMiddleware.cs:134-138`.

On 500-class errors the response body includes the raw exception message. Npgsql/EF errors, `InvalidOperationException`, `TenantRequiredException`, and argument exceptions disclose internal implementation details to callers. The OpenTelemetry span code deliberately avoids leaking the message, but the HTTP response does not — an inconsistency.
**Remediation:** Return a generic message plus `traceId` for 500s; log full detail server-side only. Reserve detailed text for 4xx input errors.

### 5. Hardcoded tenant GUID in `AddChild`
**File:** `src/Services/CRM/Application/Features/Children/Commands/AddChild/AddChildCommandHandler.cs:46` — `TenantId = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f")`.

Currently masked because `SaveChangesAsync` overwrites `TenantId` from the real tenancy context, but it is fragile and inconsistent with `AddGuardianCommandHandler` (which correctly reads `_tenancyContextAccessor.Current.TenantId`). Any future change to the `SaveChangesAsync` stamping would funnel every tenant's children into one tenant.
**Remediation:** Set `TenantId` from the tenancy context (or omit and rely on stamping); remove the hardcoded GUID.

### 6. NuGet token written to build layer / GHA cache
**Files:** `src/Services/Scheduling/Api/Dockerfile:14-15` and `src/Services/Scheduling/Infrastructure/Dockerfile` (`ARG NUGET_GITHUB_TOKEN` + `dotnet nuget add source … --password … --store-password-in-clear-text`), cached via `cache-to=type=gha,mode=max` in `.github/workflows/composite/build*/action.yml`.

The token is written in clear text into `NuGet.Config` in the restore stage. Multi-stage build keeps it out of the final image, but `mode=max` caching persists the intermediate layer (with the credential) to the Actions cache, readable by other workflow runs including PRs.
**Remediation:** Use BuildKit secrets instead of `ARG`; drop `--store-password-in-clear-text`; rotate the token.

### 7. Third-party actions pinned to mutable tags
**Files:** `.github/workflows/deploy-update-images.yml:78` (`peter-evans/create-pull-request@v8`), `composite/build*/action.yml` (`crazy-max/ghaction-github-runtime@v4`, `docker/setup-buildx-action`, `docker/login-action`), `pnpm/action-setup`, etc.

Tags are mutable; a compromised maintainer account can re-point them (supply-chain risk). Highest concern is `create-pull-request@v8` running in the `contents: write` + `pull-requests: write` job.
**Remediation:** Pin non-`actions/*` third-party actions to full commit SHAs (with a version comment); ensure Dependabot covers `github-actions`.

### 8. `curl | bash` of installer from a mutable branch in a write-scoped job
**File:** `.github/workflows/deploy-update-images.yml:41` — `curl -s https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh | bash`.

Executes remote content from `master` (mutable) in a job with `contents: write`/`pull-requests: write`. Compromise/MITM ⇒ arbitrary code with write permissions.
**Remediation:** Pin to a tagged release URL + verify checksum, or use a SHA-pinned install action.

### 9. `web` and `rabbitmq` pods have no `securityContext`
**Files:** `deploy/k8s/applications/web/deployment.yml:22-34`; `deploy/k8s/infrastructure/rabbitmq/deployment.yml:19-28`.

Unlike the well-hardened CRM/Scheduling pods, these run with defaults (root, no dropped caps, writable root FS, no seccomp). The stock `nginx` image runs as root and binds port 80.
**Remediation:** Add `runAsNonRoot`, `allowPrivilegeEscalation: false`, `capabilities: drop: [ALL]`, `seccompProfile: RuntimeDefault`; use an unprivileged nginx image/port.

### 10. Envoy admin API bound to `0.0.0.0:8001`
**Files:** `deploy/k8s/infrastructure/envoy/envoy.yaml:1-5`; `deploy/k8s/infrastructure/envoy/deployment.yml:42-44` (containerPort 8001), `:79` (`readOnlyRootFilesystem: false`).

The Envoy admin interface (`/config_dump`, `/quitquitquit`, stats) listens on all interfaces. It is not published via the Service, but with no NetworkPolicy any in-cluster pod can read config or shut the proxy down.
**Remediation:** Bind admin to `127.0.0.1`; expose only metrics; set `readOnlyRootFilesystem: true` (a `/tmp` emptyDir already exists); add container-level `runAsNonRoot`/seccomp.

### 11. No NetworkPolicies
**Files:** none exist under `deploy/k8s`.

Flat pod network in `kdvmanager-prod`: any pod can reach Envoy admin (8001), RabbitMQ (5672/15672), and — critically — the APIs directly on `crm-api:8080`/`scheduling-api:8080`, **bypassing the gateway's JWT enforcement**. Combined with #3 (no in-service authz), direct pod access is unauthenticated.
**Remediation:** Default-deny ingress NetworkPolicies; allow only ingress→web/envoy, envoy→APIs, APIs→rabbitmq.

### 12. Application connects to Postgres as `doadmin` (superuser)
**Files:** `deploy/k8s/applications/crm/deployment.yml:101-102,151-152`; `deploy/k8s/applications/scheduling/deployment.yml` (same). `POSTGRES_USER: doadmin`.

Both runtime APIs and migrators use the managed-DB admin/superuser. A compromised API pod gains full database-cluster admin. DB host and username are committed in plaintext (the password is correctly a SealedSecret ref).
**Remediation:** Per-service least-privilege roles (runtime = CRUD on its own DB; separate migration role with DDL).

### 13. CSP allows `unsafe-inline` and `unsafe-eval` in `script-src`
**File:** `src/web/nginx/nginx.conf:32`.

`script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.auth0.com` largely defeats the XSS mitigation value of the CSP.
**Remediation:** Remove `unsafe-eval` (Vite prod builds don't need it); move toward nonce/hash for scripts; keep `unsafe-inline` only in `style-src` if MUI/Emotion requires it.

### 14. CSP Auth0 domain likely mismatches configured tenant
**Files:** `src/web/nginx/nginx.conf:32` (allows `https://kdvmanager.eu.auth0.com`) vs `src/web/.env:2` (`kdvmanager-development.eu.auth0.com`).

Config drift risk: if the production tenant differs from the hardcoded CSP domain, silent-refresh iframe and token calls are blocked, tempting operators to loosen CSP to `*`.
**Remediation:** Template the CSP Auth0 domain from the same source as `VITE_APP_AUTH0_DOMAIN` at deploy time.

---

## Low severity

- **15. Permissive gateway CORS** — `deploy/k8s/infrastructure/envoy/envoy.yaml:58-61` allows any origin (`safe_regex: ".*"`). Bearer-token (not cookie) auth limits impact, but restrict to known app origins (`https://app.kdvmanager.nl`).
- **16. Swagger in production** — `src/Services/Scheduling/Api/Program.cs` calls `app.UseSwagger()` unconditionally (CRM correctly gates OpenAPI to Development). Exposes full API schema in prod.
- **17. Placeholder creds + `AllowedHosts: *`** — `src/Services/CRM/Api/appsettings.json:3-4` and Scheduling equivalent contain `User ID=sammy; password=shark` and `amqp://guest:guest@…`. Dev placeholders (overridden in prod via env from SealedSecrets), but risky if an override is ever missing; also normalizes committing credentials.
- **18. Dev cert password committed** — `src/docker-compose.override.yml` hardcodes `ASPNETCORE_Kestrel__Certificates__Default__Password`. Local-only, but treat as burned and rotate.
- **19. No non-root `USER` in images** — CRM/Scheduling/migrator/web Dockerfiles set no `USER`; safe in k8s (pod `runAsUser 1001`) but unsafe by default elsewhere and for the un-hardened web/rabbitmq pods. Also misleading `EXPOSE 80/443` while the app listens on 8080. Add `USER 1001`.
- **20. Mutable image tags** — manifests reference `linux-main`, `envoyproxy/envoy:v1.34-latest`, `rabbitmq:4-management`; with ArgoCD self-heal + `imagePullPolicy: Always`, running content can change without a git change. Pin by digest.
- **21. `returnTo` not validated** — `src/web/src/pages/auth/LoginPage.tsx`, `CallbackPage.tsx`, `lib/auth/auth.ts`. Currently safe because react-router `navigate()` is client-side only; becomes an open redirect if ever switched to `window.location`. Validate that it starts with a single `/`.
- **22. Verbose prod console logging** — `LoginPage.tsx:14-43`, `CallbackPage.tsx:25-39`, `lib/auth/auth.ts:57` log auth state/`appState` (no tokens). Gate behind `import.meta.env.DEV`; add `no-console` lint.
- **23. Missing report-query validation** — `GetNewsletterRecipientsQueryHandler` / `GetPhoneListQueryHandler` bind `Year`/`Month` unvalidated; `month=13` throws inside `new DateOnly(...)` → 500 (+ #4 leak). Validate ranges → 400/422.
- **24. `PageNumber` not clamped** — `PageParameters.cs` clamps `PageSize` (good) but not `PageNumber`; a value ≤0 yields a negative offset → DB error. Floor at 1.
- **25. ArgoCD unrestricted `default` project** — `deploy/eduframe-application.yaml`, `observability/signoz-application.yaml` run under `project: default` with `prune`/`selfHeal`. Define a restricted AppProject scoping repos/namespaces/kinds.
- **26. (Info) Unescaped LIKE wildcards** — `ChildRepository`/`GuardianRepository` search interpolates `%{search}%` without escaping `%`/`_`. Not SQL injection (parameterized, tenant-scoped); escape metacharacters for correctness/query-cost.

---

## What is done well (verified)

- **Tenancy from a signed JWT claim**, not a client-supplied header/body (`JwtTenancyResolver`) — not spoofable.
- **EF Core global query filters** on every tenant-owned entity, applied to list/search paths; `SaveChangesAsync` auto-stamps `TenantId`. **Fail-closed:** `TenancyContextAccessor.Current` throws when unset, so filtered queries error rather than return unscoped data.
- **JWT validated at the edge** by Envoy (`jwt_authn`, issuer/audience/JWKS, `require_expiration`) and configured in-service (`ValidateIssuer/Audience/Lifetime`, `RequireHttpsMetadata` when authority is HTTPS).
- **No raw/dynamic SQL** anywhere; all access via parameterized EF Core LINQ. **Pagination capped at 100.**
- **Correlation-ID header validated and length-capped** (no log injection).
- **Frontend token handling:** Auth0 `cacheLocation="memory"` + refresh tokens; access tokens never persisted to storage or logged; no `dangerouslySetInnerHTML`/`eval`/`document.write`. Good baseline nginx headers (`X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`, HSTS, COOP/COEP/CORP, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`).
- **Production secrets are Bitnami SealedSecrets** (encrypted ciphertext, no plaintext). No Auth0 client secret in the SPA (only public domain/audience/client-id). Postgres uses `sslmode=require`; ingress has cert-manager TLS.
- **CRM/Scheduling pods hardened:** `runAsNonRoot`, `runAsUser 1001`, `readOnlyRootFilesystem: true`, `allowPrivilegeEscalation: false`, `capabilities: drop [ALL]`, `seccompProfile: RuntimeDefault`, resource limits. No `pull_request_target`, no self-hosted runners; PR jobs use `contents: read` and don't push.

---

## Recommended remediation order

1. **#1** — Fix the `FindAsync` tenant-isolation bypass (replace with filtered queries + regression test). Highest priority.
2. **#2, #6** — Stop exposing the NuGet PAT to PR builds; switch to BuildKit secrets; rotate the token.
3. **#3, #11** — Add an in-service fallback authorization policy and default-deny NetworkPolicies (defense in depth so direct pod access isn't unauthenticated).
4. **#4, #5** — Stop leaking exception messages; remove the hardcoded tenant GUID.
5. **#9, #10, #12** — Harden `web`/`rabbitmq` pods, lock down the Envoy admin port, and drop `doadmin` for least-privilege DB roles.
6. **#7, #8, #20** — Pin actions/installers to SHAs/checksums and images to digests.
7. **#13–#26** — Frontend CSP hardening and the remaining low-severity items.
