# Observability Stack Review & Improvement Plan

_Review date: 2026-07-06. Scope: everything telemetry-related in this repo — .NET service instrumentation, the Envoy gateway, the OpenTelemetry Collector, the SigNoz deployment, local dev compose, and docs._

## 1. Current architecture

```
frontend (React)          ──(nothing)──────────────────────────────┐
envoy gateway             ──traces (OTLP gRPC)──┐                  │
crm-api / scheduling-api  ──traces+metrics+logs─┤→ otel-collector  │  SigNoz UI
                             (OTLP gRPC :4317)  │  (observability  │  signoz.kdvmanager.nl
k8s_cluster / kubeletstats ─────────────────────┘   namespace)     │
                                                      │            │
                                                      └─→ signoz-otel-collector → ClickHouse
                                                          (signoz namespace, Helm chart 0.88.2)
```

**What is genuinely good:**

- Both APIs have a complete OTel SDK setup: tracing with `RecordException` and request/response enrichment, `ParentBasedSampler(TraceIdRatioBasedSampler)` with a configurable ratio, ASP.NET Core + HttpClient + runtime instrumentation, MassTransit trace source, and OTLP export gated on config (`src/Services/*/Api/ConfigureServices.cs`).
- Logs are structured JSON to stdout plus OTLP with trace correlation, rich resource attributes, and scope support (`src/Shared/KDVManager.Shared.Infrastructure/Logging/LoggingExtensions.cs`).
- Correlation ID middleware + outgoing propagation handler, and trace IDs are returned in error responses (`ExceptionHandlerMiddleware` includes `traceId` in the JSON body).
- Envoy generates request IDs, uses them for trace sampling, and exports OTLP traces to the collector (`deploy/k8s/infrastructure/envoy/envoy.yaml`).
- The collector has `memory_limiter`, `batch`, a resource processor, a health-check extension wired to probes, proper RBAC for `k8s_cluster`/`kubeletstats`, and a `/healthz` span filter.
- SigNoz is deployed via the official Helm chart through ArgoCD with ingress + TLS and small-cluster resource tuning.

The foundation is solid. The problems are almost all in the "last mile": dead configuration, silent no-ops, a broken dev setup, no alerting, and a blind frontend.

## 2. Findings

### Critical

**C1 — No alerting at all.** Alertmanager is explicitly disabled in the SigNoz values (`deploy/k8s/observability/signoz-application.yaml`) and there are no alert rules anywhere in the repo. The stack is purely passive: nobody is notified when error rates spike, pods crash-loop, the DB is unreachable, or certificates fail to renew. For a production system holding childcare data, this is the single biggest gap.

**C2 — The frontend is completely blind.** `src/web/package.json` has no error tracking, no web-vitals, no OTel JS, and the source has no error boundary reporting. A client-side crash, a broken API integration after deploy, or an Auth0 misconfiguration is invisible unless a user reports it. Given this is a SPA where most bugs will surface in the browser, this is the largest coverage hole.

**C3 — Local dev collector config is invalid.** `src/otel-collector-config.yaml` (mounted by `src/docker-compose.yml`) declares pipelines with `exporters: []`. The collector refuses to start with an empty exporter list ("pipeline must have at least one exporter"), so local telemetry is broken and services log OTLP export failures. Nobody can validate instrumentation changes locally before they hit production.

**C4 — SigNoz Helm values are likely partially silent no-ops.** The values in `signoz-application.yaml` nest `clickhouse`, `queryService`, `frontend`, `otelCollector`, `alertmanager`, and `logs` under the `signoz:` key. In the official chart (≥0.7x, and definitely 0.88.2), `clickhouse` and `otelCollector` are **top-level** values keys (subcharts/components), and `queryService`/`frontend` no longer exist as separate components (merged into the unified `signoz` binary). Unrecognized nested keys are silently ignored by Helm — meaning the ClickHouse 5Gi persistence size, ClickHouse memory tuning, and collector batch settings are probably **not applied at all**, and the cluster is running chart defaults. Verify with `helm template` against chart 0.88.2 and flatten the keys accordingly.

### High

**H1 — `debug` exporter with `verbosity: detailed` is in every production pipeline.** In `deploy/k8s/observability/otel-collector-config.yaml`, all three pipelines export to `debug` alongside SigNoz. Every span, metric point, and log record is dumped to the collector's stdout in full detail. That is significant CPU/log volume, and it writes request payloads/attributes (potentially personal data — this is a childcare CRM) into node-level container logs outside the observability store. Remove it, or keep it with `verbosity: basic` behind a comment for incident use.

**H2 — Collector image is `otel/opentelemetry-collector-contrib:latest`.** Unpinned. Any pod reschedule can silently pull a new collector version; contrib has a history of breaking config changes between minors. Pin a digest or at least a minor version.

**H3 — No database spans.** Neither service registers EF Core/Npgsql tracing (`Npgsql` ships a built-in `ActivitySource`; nothing calls `AddNpgsql()`/`AddSource("Npgsql")`, and there is no `OpenTelemetry.Instrumentation.EntityFrameworkCore` package). Traces stop at the controller — the most common performance question ("which query is slow?") cannot be answered. This is a one-line fix per service with high payoff.

**H4 — Health checks are decorative.** Both services call the bare `services.AddHealthChecks()` — no PostgreSQL check, no RabbitMQ check — and liveness, readiness, and startup probes all hit the same `/healthz`, which always returns Healthy while the process is up. A pod stays "Ready" with its database or broker unreachable, so Envoy keeps routing to it. Split `/healthz` (liveness, bare) from `/readyz` (readiness, with `AddNpgSql()` + RabbitMQ checks).

**H5 — Probable duplicate log/metric ingestion via k8s-infra.** The SigNoz chart installs its `k8s-infra` agent (DaemonSet) by default, which tails container stdout and collects kubeletstats. The apps write every log record to stdout as JSON **and** push the same records via OTLP; the custom collector also collects `kubeletstats`/`k8s_cluster`. If chart defaults are in effect (see C4 — your overrides may not be applying), every application log line is likely ingested twice and node/pod metrics twice, doubling ClickHouse volume on a deliberately small (5Gi?) disk. Verify in the cluster (`kubectl get ds -n signoz`), then either disable `k8s-infra` log collection or stop pushing logs over OTLP (pick one path; see plan).

### Medium

**M1 — Dead/orphaned collector config.** In the production collector config: the `prometheus` receiver (which scrapes the collector's own exporter port — circular and pointless), the `prometheus` exporter, and the `otlp/jaeger` exporter (pointing at a `jaeger.observability` service that does not exist in the repo) are all declared but **not referenced by any pipeline**. Likewise `deploy/k8s/observability/clickhouse-config.yaml` is a ConfigMap nothing mounts (SigNoz's ClickHouse lives in the `signoz` namespace and is chart-managed). Dead config actively misleads — the docs already claim Jaeger and Prometheus exist (see M5).

**M2 — `prometheus.io/scrape` annotations point at nothing.** App pods (`deploy/k8s/applications/*/deployment.yml`) advertise `/metrics` on port 8080 and Envoy advertises `/stats/prometheus` on 8001, but the .NET apps expose no Prometheus endpoint (they push OTLP), and nothing in the cluster does annotation-based scraping. Envoy's rich metrics (upstream errors, JWT rejections, per-route latency) are therefore collected nowhere. Either add a `prometheus` receiver scrape job for Envoy in the custom collector or drop the annotations.

**M3 — Custom metrics are mostly dead code.** `SchedulingApiMetrics`/`CrmApiMetrics` define `*_requests_total` and `*_request_duration_seconds` that are never recorded (only `ErrorCounter` is used, in the exception middleware). They duplicate what `AddAspNetCoreInstrumentation()` already emits (`http.server.request.duration`). Delete the duplicates; keep the meter for actual business metrics (schedules created, children registered, absences booked — currently zero business metrics exist).

**M4 — Inconsistent resource attributes across signals.** Logs get `service.version`, `deployment.environment`, `service.namespace`, and instance ID (`LoggingExtensions.cs`); traces/metrics only get `service.name` (`ConfigureServices.cs`). In SigNoz you can't reliably filter traces by environment or correlate by version. Centralize resource building in one shared extension. Also: the OTel bootstrap (~80 lines of sampler + enrichment + exporter code) is copy-pasted between CRM and Scheduling — move it into `KDVManager.Shared.Infrastructure` next to the logging extension so the two can't drift (they already have: instrumentation package versions differ, 1.15.1 vs 1.16.0).

**M5 — The documentation describes a different stack.** `docs/observability-setup.md` references chart 0.79.0 (deployed: 0.88.2), a Jaeger UI and Prometheus at public URLs (neither exists), SigNoz services in the `observability` namespace (actual: `signoz`), and calls Alertmanager a feature (it's disabled). Anyone debugging from these docs loses an hour.

**M6 — No MassTransit metrics.** The MassTransit trace source is registered, but not its meter (`MassTransit.Monitoring.InstrumentationOptions.MeterName`), so there are no consumer-lag/throughput/failure metrics for the event bus, and RabbitMQ itself (management plugin is enabled) exposes Prometheus metrics on :15692 that nothing collects.

### Low

- **L1 — Collector is a single replica** with no PDB; a node drain drops all telemetry for the duration (buffered only by app-side retry). Acceptable at this scale, but add `sending_queue` awareness/2 replicas if it ever matters.
- **L2 — No retention policy is set** for ClickHouse (SigNoz default is 7d logs/traces, 30d metrics). Combined with C4 (persistence size possibly not applied), disk exhaustion behavior is undefined. Set retention explicitly in SigNoz.
- **L3 — Envoy has no access logs** — fine while tracing works, but with a 0.25s export timeout to a single-replica collector, gateway visibility disappears whenever the collector does. A minimal JSON access log to stdout is cheap insurance.
- **L4 — Migrator init containers** get `OTEL_*` env vars but the EF bundle migrator doesn't emit telemetry; failed migrations are only visible in `kubectl logs`. Low priority, but a log line + duration metric around migrations would make deploy failures diagnosable in SigNoz.

## 3. Recommendation

**Keep the SigNoz + OTel Collector architecture.** It is the right shape for a small self-hosted setup: one vendor-neutral pipeline, one UI, one datastore. Do not add Prometheus/Grafana/Loki — that would triple the operational surface for no gain at this scale. The investment should go into **making what exists trustworthy** (config that actually applies, no silent duplication, pinned versions), **closing the two blind spots** (frontend, database spans), and **turning the stack from passive to active** (alerting). Roughly in that order.

One architectural simplification worth considering (not urgent): you run two collectors — the custom gateway in `observability` and SigNoz's own in `signoz`. At this scale a single hop would do. Keeping the custom gateway is defensible (it isolates apps from SigNoz upgrades and owns k8s metrics collection); if you keep it, it must be pinned, deduplicated with k8s-infra, and free of dead config.

## 4. Improvement plan

### Phase 1 — Stop the bleeding (hours of work)

1. **Fix local dev** — give `src/otel-collector-config.yaml` a `debug` exporter in each pipeline (empty exporter lists are invalid and the collector won't start).
2. **Remove `debug` exporter from all production pipelines**; delete the unused `prometheus` receiver/exporter, `otlp/jaeger` exporter, and the orphaned `clickhouse-config.yaml` ConfigMap.
3. **Pin the collector image** to a specific `opentelemetry-collector-contrib` version.
4. **Validate and flatten the SigNoz Helm values** (`helm template` against 0.88.2): move `clickhouse`/`otelCollector` to top level, delete `queryService`/`frontend`/`alertmanager` blocks that no longer match the chart schema, and set an explicit ClickHouse persistence size and SigNoz retention (suggest 7–15d traces/logs).
5. **Resolve log duplication**: confirm whether k8s-infra is tailing stdout; if so, disable OTLP log export from the apps (keep JSON stdout as the single log path — it also survives collector outages) or disable k8s-infra `presets.logsCollection`. One path, not both.

### Phase 2 — Close the blind spots (a day or two)

6. **Add DB tracing**: `Npgsql.OpenTelemetry` → `tracing.AddNpgsql()` in both services.
7. **Real health checks**: `AspNetCore.HealthChecks.NpgSql` + a RabbitMQ check on a `/readyz` endpoint for readiness; keep bare `/healthz` for liveness. Update deployment probes.
8. **Frontend observability**: lightest viable option is SigNoz's OTel JS distro or plain `@opentelemetry/sdk-trace-web` with fetch instrumentation + a global error handler shipping to the collector's OTLP/HTTP port (4318 is already exposed, but not via ingress — route `/v1/traces` through Envoy or a dedicated ingress with strict CORS). If self-hosting browser telemetry feels heavy, a free-tier Sentry for errors + web-vitals alone would close 80% of the gap.
9. **Envoy metrics**: add a collector `prometheus` receiver scrape job for `envoy:8001/stats/prometheus` (JWT rejections, per-route 5xx, upstream timeouts), and add a minimal JSON access log.
10. **Consolidate .NET OTel bootstrap** into `KDVManager.Shared.Infrastructure` (one `AddKdvManagerTelemetry(serviceName)`): unified resource attributes across all three signals, shared sampler logic, MassTransit meter registration, aligned package versions. Delete the dead request counter/duration custom metrics.

### Phase 3 — From passive to active (ongoing)

11. **Enable SigNoz alerting** (built into the unified binary; wire a notification channel — email or Slack) and define the first five alerts: API 5xx rate, p99 latency, pod restart count, ClickHouse/collector health, and RabbitMQ consumer failure rate. Add an external uptime check (e.g. a free healthcheck service against `kdvmanager.nl` and `/healthz` endpoints) so you're alerted even when the whole cluster or SigNoz itself is down.
12. **Business metrics + dashboards**: use the existing custom meters for domain events (schedules created, absences, child registrations) and build one SigNoz dashboard per service plus one "golden signals" overview.
13. **Rewrite `docs/observability-setup.md`** to describe the actual stack (this document can seed it), including a runbook section: where to look for a 5xx spike, how to find a trace from a user-reported error via the `traceId` in API error responses, how to check collector health (`:13133`, zpages).
14. **Revisit sampling before traffic grows**: 100% sampling is right for today's volume; document the `OTEL_TRACE_SAMPLING_RATIO` lever and consider tail-based sampling at the collector (keep all errors + slow traces) when volume makes ratio sampling lossy for rare failures.

## 5. Priority summary

| # | Finding | Severity | Effort |
|---|---------|----------|--------|
| C1 | No alerting anywhere | Critical | Medium |
| C2 | Frontend has zero observability | Critical | Medium |
| C3 | Local dev collector config invalid | Critical | Trivial |
| C4 | Helm values likely silently ignored | Critical | Small |
| H1 | Detailed debug exporter in prod pipelines | High | Trivial |
| H2 | Collector image `:latest` | High | Trivial |
| H3 | No DB spans (Npgsql/EF) | High | Trivial |
| H4 | Health checks don't check dependencies | High | Small |
| H5 | Probable duplicate log/metric ingestion | High | Small |
| M1–M6 | Dead config, dead metrics, stale docs, missing Envoy/MassTransit metrics, drifted copy-paste bootstrap | Medium | Small each |
| L1–L4 | Collector SPOF, retention, access logs, migrator telemetry | Low | Small each |

Phase 1 is almost entirely deletion and pinning — an afternoon that removes the misleading and wasteful parts. Phases 2–3 are where observability starts earning its keep.
