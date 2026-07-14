# Observability Stack

_Last updated: 2026-07-14. For the review that shaped this setup, see [observability-review.md](observability-review.md)._

## Architecture

```
frontend (React)     ──errors/vitals/fetch traces──→ https://api.kdvmanager.nl/telemetry/…
envoy gateway        ──traces (OTLP gRPC) ─┐              │ (Envoy route, no JWT)
crm-api              ──traces+metrics+logs─┤              ▼
scheduling-api       ──traces+metrics+logs─┼→ otel-collector (observability ns, :4317/:4318)
envoy /stats/prometheus ←──scraped─────────┤
k8s_cluster + kubeletstats ────────────────┘              │
                                                          ▼
                                       signoz-otel-collector (signoz ns) → ClickHouse
                                                          │
                                              SigNoz UI: https://signoz.kdvmanager.nl
```

- **SigNoz** (traces, metrics, logs, dashboards, alerts) — official Helm chart `0.132.2`
  (SigNoz `v0.132.2`), pinned in `deploy/k8s/observability/signoz-application.yaml` and deployed by
  ArgoCD into the `signoz` namespace. The chart also owns ClickHouse `25.12.5` and the
  `signoz-telemetrystore-migrator` job that applies schema and background data migrations.
- **OpenTelemetry Collector** (gateway) — pinned `opentelemetry-collector-contrib` image, deployed from
  `deploy/k8s/observability/` into the `observability` namespace. Receives OTLP from all services,
  Envoy, and the browser; scrapes Envoy's Prometheus stats; collects cluster/kubelet metrics; exports
  everything to SigNoz. Health check on `:13133`, zpages on `:55679`, pprof on `:1777`.
- There is deliberately **no separate Prometheus/Grafana/Loki/Jaeger** — SigNoz is the single UI and store.

## Backend (.NET) instrumentation

One shared bootstrap wires everything, so the services cannot drift:

- `KDVManager.Shared.Infrastructure/Telemetry/TelemetryExtensions.cs` —
  `services.AddKdvManagerTelemetry(configuration, "<service-name>", <meter names…>)` sets up:
  - **Tracing**: ASP.NET Core (with exception recording and request/response enrichment), HttpClient,
    **Npgsql** (database spans), MassTransit. Every span started within a tenant flow (HTTP request or
    MassTransit consume) is stamped with `tenant.id` by `TenantEnrichmentProcessor`, backed by the
    AsyncLocal `TenancyContextAccessor`. Parent-based ratio sampling, configured via
    `Otel:TraceSamplingRatio` or `OTEL_TRACE_SAMPLING_RATIO` (default 1.0).
  - **Metrics**: ASP.NET Core, HttpClient, .NET runtime, Npgsql connection metrics, MassTransit bus
    metrics, plus each service's custom meter (`crm-api` / `scheduling-api`, used for the error counter
    in the exception middleware).
  - JWT authentication failures are logged as warnings (`JwtAuthentication` category, reason only).
  - OTLP export is enabled only when `Otel:Endpoint` (or `OTEL_EXPORTER_OTLP_ENDPOINT`) is set.
- `Telemetry/KdvResource.cs` — one resource definition (service.name/namespace/version/instance,
  deployment.environment, host.name) shared by traces, metrics, **and** logs.
- `Logging/LoggingExtensions.cs` — structured JSON to stdout always; OTLP log export when the endpoint
  is configured. Log records carry trace/span IDs for correlation.
- API error responses include the `traceId`, so a user-reported error can be looked up directly in SigNoz.

### Health endpoints

- `/healthz` — **liveness**: process-up only, no dependency checks (used by the liveness probe).
- `/readyz` — **readiness**: runs all registered checks — PostgreSQL (`AddDbContextCheck`) and the
  MassTransit bus (auto-registered) — used by readiness and startup probes.

## Frontend instrumentation

`src/web/src/telemetry/` — initialized in `src/index.tsx` before React renders; a **no-op unless**
`VITE_OTEL_EXPORTER_OTLP_ENDPOINT` is set at build time (see `src/web/.env.example`):

- **Errors**: `window.onerror`, `unhandledrejection`, and the router error boundary report rate-limited
  (20/min) `app.error` spans with `session.id`.
- **Fetch tracing**: `traceparent` propagated only to the app's own API origin (never Auth0).
- **Web vitals**: CLS/INP/LCP/FCP/TTFB emitted as `web.vital` spans.

Browser telemetry is POSTed to `https://api.kdvmanager.nl/telemetry/v1/traces` — an Envoy route
(JWT-exempt, CORS-guarded, rate-limited to 30 rps with a 60-token burst per Envoy pod via
`local_ratelimit`) that forwards to the collector's OTLP/HTTP port 4318. Production builds get
the endpoint and `VITE_APP_VERSION` (image tag) via build args in `src/docker-compose.yml`.

## Envoy gateway

- OTLP tracing to the collector (service name `kdvmanager-envoy`), request-ID-based sampling.
- `/stats/prometheus` on admin port 8001, exposed on the `envoy` Service and scraped by the collector
  (gateway 5xx, upstream timeouts, JWT rejections).
- Structured JSON access logs to stdout (timestamp, method, path, status, duration, upstream cluster,
  request id, user agent) — the fallback when tracing is down.

## Local development

`src/docker-compose.yml` runs a collector with `src/otel-collector-config.yaml` — a minimal config that
prints telemetry via the `debug` exporter (`docker compose logs -f otel-collector`). The override file
points the web build at `http://localhost:5200/telemetry`. Services pick up the endpoint via
`OTEL_EXPORTER_OTLP_ENDPOINT`; without it, telemetry is disabled and logs still go to stdout as JSON.

## Runbook

| Symptom | Where to look |
|---|---|
| User reports an error | Ask for the `traceId` from the error message/response → SigNoz → Traces → filter by trace ID |
| 5xx spike | SigNoz service view (crm-api / scheduling-api) → error-rate panel → example traces; Envoy access logs (`kubectl logs deploy/envoy -n kdvmanager-prod`) if no traces arrive |
| Pod not Ready | `kubectl describe pod` → readiness probe on `/readyz` — failing check names Postgres or the bus |
| No telemetry arriving | `kubectl logs deploy/otel-collector -n observability`; health `:13133`, pipeline introspection via zpages `:55679`; then SigNoz collector in `signoz` ns |
| SigNoz down/slow | `kubectl get pods -n signoz`; ClickHouse memory caps are set in the Application values |
| SigNoz upgrade stuck | `kubectl get job signoz-telemetrystore-migrator -n signoz`; inspect it with `kubectl logs job/signoz-telemetrystore-migrator -n signoz --all-containers` |
| ArgoCD drift | `kubectl get application signoz -n argocd` (chart) and the kustomize app for `deploy/k8s/observability` |

## Known gaps / follow-ups

1. **Alerting**: revalidate the existing rules and email notification channel after the SigNoz
   upgrade; there is still no external uptime check for kdvmanager.nl itself.
2. **Retention**: set explicitly in SigNoz (Settings → General); ClickHouse disk is small (5Gi).
3. **Business metrics**: the per-service meters currently only count errors — domain metrics
   (schedules created, registrations, absences) belong there.
4. **Pod log collection**: only OTLP app logs and Envoy stdout access logs are shipped; nginx/
   RabbitMQ/ClickHouse pod logs are not. SigNoz's `k8s-infra` chart (DaemonSet) would add this and
   replace the hand-rolled `kubeletstats`/`k8s_cluster` receivers.
