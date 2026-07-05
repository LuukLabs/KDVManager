# Observability Stack Review — July 2026

## Scope

Full review of telemetry collection, storage, visualization, alerting, and application-level
instrumentation across the KDVManager platform: the two .NET APIs (CRM, Scheduling), the Envoy
gateway, the React web app, and the Kubernetes/ArgoCD-managed collector + SigNoz deployment.

## Current State

- **Backend instrumentation**: Both APIs use OpenTelemetry (traces + metrics), exported via OTLP
  to an in-cluster `otel-collector` when `Otel:Endpoint`/`OTEL_EXPORTER_OTLP_ENDPOINT` is set.
  ASP.NET Core, HttpClient, and .NET runtime instrumentation are enabled; sampling ratio is
  configurable (defaults to 100%).
- **Logging**: `KDVManager.Shared.Infrastructure.Logging.LoggingExtensions` wires structured JSON
  console logging plus an OpenTelemetry log exporter, with scopes and a consistent resource
  (service name/version/instance, environment, cluster namespace).
- **Correlation**: A well-implemented `CorrelationIdMiddleware` + `CorrelationIdPropagationHandler`
  pair aligns `X-Request-ID` with the OTel trace ID across service-to-service HTTP calls, with
  input validation against log/header injection.
- **Collector**: A self-managed `otel/opentelemetry-collector-contrib` deployment (1 replica) in the
  `observability` namespace receives OTLP and re-exports to SigNoz, with `k8s_cluster`/`kubeletstats`
  receivers for cluster metrics and a Prometheus scrape endpoint on `:8889`.
- **Backend platform**: SigNoz (traces/metrics/logs UI), deployed via the official Helm chart as an
  ArgoCD `Application` into a **`signoz`** namespace, backed by ClickHouse (5Gi PVC) with
  Alertmanager disabled.
- **Gateway tracing**: Envoy has native OpenTelemetry tracing configured, exporting to the same
  collector, so edge spans should tie into the same traces as the .NET services.
- **Frontend**: No observability of any kind — no error tracking, no RUM, no trace propagation.

## Findings

### High priority

1. **No alerting is wired up.** Alertmanager is explicitly disabled in the SigNoz Helm values, and
   there are no alert rules, notification channels, or on-call integration anywhere in the repo.
   The stack can show you an outage after the fact, but nothing pages anyone. This is the biggest
   gap relative to the stated goal of "error tracking and alerting" (`docs/observability-setup.md`).

2. **Health checks don't check anything.** `services.AddHealthChecks()` registers zero checks in
   both APIs, yet `/healthz` backs the startup, liveness, *and* readiness probes
   (`deploy/k8s/applications/{crm,scheduling}/deployment.yml`). A Postgres or RabbitMQ outage will
   not fail the health check, so Kubernetes will keep routing traffic to pods that 500 on every
   real request instead of cycling/isolating them. Add DB and broker health checks
   (`AddNpgSql`/`AddRabbitMQ`) and consider splitting liveness (process alive) from readiness
   (dependencies reachable).

3. **Frontend has zero observability.** `ErrorPage.tsx` does `console.error(error)` and nothing
   else — no Sentry/equivalent, no unhandled-rejection/window.onerror capture, no web-vitals/RUM,
   and no propagation of the W3C trace context from browser `fetch` calls into the backend traces
   despite the backend already supporting it. Every client-side crash and slow page load is
   currently invisible. This is the largest blind spot in the stack.

4. **Docs describe infrastructure that doesn't exist**, which is dangerous during an incident.
   `docs/observability-setup.md` and `deploy/k8s/README.md` reference:
   - A **Jaeger UI** at `jaeger.kdvmanager.nl` and a **Prometheus UI** at `prometheus.kdvmanager.nl`
     — no Jaeger/Prometheus Deployment, Service, or Ingress exists anywhere in `deploy/k8s`.
   - Basic-auth-secured dashboards — no `auth-type`/`auth-secret` ingress annotations exist for any
     observability ingress. (SigNoz does have its own login, but the docs describe a different,
     stronger control that was never implemented.)
   - Service DNS names in the `observability` namespace (`signoz-signoz.observability.svc...`)
     that don't match the real deployment, which lives in the **`signoz`** namespace
     (`signoz-otel-collector.signoz.svc.cluster.local`, matching the actual collector config).
   - An `otel-collector-servicemonitor.yaml` file that isn't present.

   An engineer following these docs during an outage will look for the wrong URLs and namespaces.

### Medium priority

5. **Dead/orphaned collector config.**
   - `otlp/jaeger` exporter is defined in `otel-collector-config.yaml` but used in no pipeline —
     vestigial from a pre-SigNoz setup.
   - `clickhouse-config.yaml` (a standalone ClickHouse ConfigMap) exists in `deploy/k8s/observability`
     but is **not listed in `kustomization.yaml`**, so it's never applied. It's a leftover from the
     manual-ClickHouse era the docs themselves say was migrated away from — safe to delete.
   - `debug` exporter (`verbosity: detailed`) runs unconditionally in all three pipelines in
     production, which is expensive (full payload logging) and not something you'd want on for the
     traces of every request; scope it behind an env-gated feature or drop it outside active
     troubleshooting.

6. **Custom metrics are partly dead code.** `CrmApiMetrics`/`SchedulingApiMetrics` each define
   `RequestCounter` and `RequestDuration`, but nothing ever calls `.Add()`/`.Record()` on them —
   only `ErrorCounter` is used (from the exception middleware). ASP.NET Core's built-in
   instrumentation already emits `http.server.request.duration`, so these are redundant even if
   wired up; delete them or actually use them for something the built-in metric doesn't cover
   (e.g. business-level counters).

7. **Error-handling and telemetry enrichment have drifted between the two services**, despite
   being copy-pasted from a common origin:
   - CRM's `ExceptionHandlerMiddleware` handles `JsonException`, `BadHttpRequestException`, and
     `InvalidDataException` as 400s; Scheduling's does not, so the same failure mode
     (malformed request body) surfaces as a 500 + `LogError` in Scheduling instead of a 400 +
     `LogWarning` — inflating Scheduling's apparent error rate and paging noise once alerting exists.
   - CRM's Activity enrichment on error deliberately avoids putting the exception message into
     span tags/status ("privacy-friendly: no message/stacktrace"); Scheduling's puts the raw
     `exception.Message` into `SetTag("error.message", ...)` and `SetStatus(...)`. Given this is a
     childcare (KDV) system, exception messages can plausibly include personal data (names, IDs) —
     this is a real, if narrow, PII-in-traces exposure. Align both services on CRM's approach.
   - Both middlewares log `RemoteIp` and `UserAgent` on every error; confirm this is acceptable
     under your data-retention/GDPR posture for a childcare product, and make sure ClickHouse's TTL
     (see #8) is short enough to matter.

8. **No retention/TTL policy and a very small disk.** ClickHouse's PVC is 5Gi with no TTL settings
   configured for traces/logs/metrics tables, and trace sampling defaults to 100% (no
   `OTEL_TRACE_SAMPLING_RATIO` is set in the k8s deployment env). Self-hosted SigNoz/ClickHouse's
   most common failure mode is silently filling its disk and refusing writes — which takes down
   observability at exactly the moment (an incident driving up error/traffic volume) you need it
   most. Set explicit TTLs in the SigNoz Helm values and size the PVC (or sampling rate) to match.

9. **Single point of failure in the collector.** `otel-collector` runs as a 1-replica Deployment
   with no PodDisruptionBudget. A node drain or OOM (it only gets 512Mi limit while running
   `k8s_cluster`+`kubeletstats`+full debug-verbosity export) drops all telemetry cluster-wide until
   it's rescheduled. Not urgent at current scale, but worth a `replicas: 2` + PDB before you rely on
   this for incident response.

### Low priority / cleanup

10. **OpenTelemetry package versions have drifted** between CRM (`Instrumentation.AspNetCore`/`Http`
    1.16.0) and Scheduling (1.15.0/1.15.1). Low risk today, but bump both together going forward to
    avoid behavioral differences between services.

11. **The `/healthz` span-drop filter only applies to the traces pipeline**, not logs — health-check
    noise still flows into log storage. Minor volume/cost issue.

12. **The collector's Prometheus *receiver* scrapes its own `:8889` exporter endpoint** and re-feeds
    it into the same metrics pipeline (`localhost:8889` → `otlp/signoz` + `debug`). This is a
    confusing self-scrape loop; if the goal is "let an external Prometheus scrape the collector,"
    the `prometheus` *exporter* on `:8889` already does that — the `prometheus` *receiver* isn't
    needed for that goal and should be removed unless there's a specific missing metric it exists
    to capture.

13. **No CI validation of the Kubernetes manifests** (no `kustomize build`, `kubeconform`/`kubeval`,
    or `yamllint` step in `.github/workflows`). Several of the issues above (dead ConfigMap,
    orphaned exporter, doc drift) are exactly the class of problem a `kustomize build --dry-run`
    check in CI would have caught before merge.

## Recommended Improvement Plan

**Phase 1 — Close the alerting and health gaps (highest leverage, low effort)**
- Enable Alertmanager (or SigNoz's native alerting) with at least: error-rate, p95 latency, and
  pod-restart alerts routed to Slack/email/PagerDuty.
- Add real dependency checks (Postgres, RabbitMQ) to `AddHealthChecks()`; split into a liveness
  check (process only) and a readiness check (dependencies), and point the k8s probes accordingly.
- Set ClickHouse TTLs and confirm the 5Gi PVC is sized for your real retention target; consider
  lowering default trace sampling from 100% now that you have real traffic.

**Phase 2 — Frontend parity**
- Add browser error/exception tracking (Sentry or equivalent) wired to the same OTel/SigNoz
  backend if possible, or a lightweight OTel Web SDK for trace-context propagation from `fetch`
  calls, so a user-reported bug can be traced end-to-end from click to backend span.
- Capture unhandled promise rejections and `window.onerror`, not just React Router's error
  boundary.

**Phase 3 — Consistency and cleanup**
- Unify the two `ExceptionHandlerMiddleware` implementations (ideally extract to
  `KDVManager.Shared.Infrastructure`) so exception taxonomy and trace-enrichment privacy rules
  don't drift again; adopt CRM's no-message-in-span-tags approach everywhere.
- Delete dead config: unused `otlp/jaeger` exporter, orphaned `clickhouse-config.yaml`, unused
  `RequestCounter`/`RequestDuration` metrics (or start actually recording them for something
  meaningful).
- Rewrite `docs/observability-setup.md` to match reality (namespace `signoz`, no Jaeger/Prometheus
  UI, no basic auth) — or delete the false claims — so it's trustworthy during an incident.

**Phase 4 — Resilience and guardrails**
- Scale `otel-collector` to 2 replicas with a PodDisruptionBudget; right-size memory limits given
  `k8s_cluster`/`kubeletstats` plus debug-verbosity export.
- Gate the `debug` exporter behind an environment flag instead of running it unconditionally in
  production.
- Add a CI step that runs `kustomize build deploy/k8s` (and ideally `kubeconform`) so manifest drift
  like the unreferenced ConfigMap is caught automatically.
- Align OpenTelemetry package versions across services as part of routine dependency bumps.
