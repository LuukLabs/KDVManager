# SigNoz alerting as code

Starter alert rules for the KDVManager observability stack, applied via the SigNoz API so they are
versioned here instead of living only in the UI.

## Rules

| File | Alert | Fires when |
|---|---|---|
| `alerts/api-error-rate.json` | High API error count | Error-span rate per service above threshold (5m) |
| `alerts/api-latency-p99.json` | High API p99 latency | p99 > 2s for a full 5m window |
| `alerts/pod-restarts.json` | Container restarting | Any container restarted > 3 times |
| `alerts/telemetry-pipeline-down.json` | Telemetry pipeline down | No APM data at all for 10m (absence alert) |
| `alerts/container-memory.json` | Container memory near limit | > 90% of the memory limit for 10m |

## Usage

```bash
# 1. Create an API key: SigNoz UI -> Settings -> API Keys (role: Admin)
export SIGNOZ_API_KEY=...

# 2. Preview, then apply (idempotent: rules are upserted by name)
./apply_alerts.py --dry-run
./apply_alerts.py

# Optional: set data retention explicitly (ClickHouse disk is small)
./apply_alerts.py --retention traces=360h logs=360h metrics=720h
```

`SIGNOZ_URL` overrides the default `https://signoz.kdvmanager.nl`.

## Notes

- **Notification channel**: rules have no `preferredChannels`, so they notify every configured
  channel. Add a channel once in the UI (Settings → Alert Channels — Slack webhook or email; email
  requires SMTP configured on the SigNoz deployment). Rules-as-code can pin channel names later via
  `preferredChannels`.
- **Schema caveat**: the builder-query JSON was written against the SigNoz v0.88.x API but has not
  been validated against a live instance from this repo. The API validates on apply — if a rule is
  rejected, create the equivalent rule once in the UI, `GET /api/v1/rules`, and align the JSON with
  what the UI produced.
- The MassTransit consumer-fault alert from the review is intentionally not included yet: add it once
  the bus metrics are visible in SigNoz and the exact metric name is known.
- An **external uptime check** (e.g. a free healthcheck service watching kdvmanager.nl) is still
  recommended — SigNoz cannot alert on its own cluster being down.
