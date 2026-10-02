# Observability

Two OpenTelemetry collectors. No storage backend runs in the cluster.

```
apps ─OTLP─┐
browser ───┤ (via Envoy /telemetry/)
Envoy ─────┼──▶  otel-collector (gateway, Deployment)  ──▶ exporter
           │       + k8s events, Envoy /stats
otel-agent ┘  (DaemonSet: container logs, kubelet stats)
```

`otel-collector` is the **single egress point**. Everything is funnelled through
it so that choosing or changing a backend is one edit in one file.

## Why two collectors

`otel-agent` must be a DaemonSet: container log files and the kubelet stats
endpoint are only reachable from the node itself. The previous single-replica
Deployment could only ever see one node's worth of either, so logs and pod
metrics from any other node were silently missing.

The cluster-scoped receivers (`k8sobjects`, `prometheus`) stay on the gateway's
single replica. Running them per-node would duplicate every Kubernetes event
once per node.

## Attaching a backend

Nothing leaves the cluster today: the gateway ends in a `debug` exporter that
summarises each batch to its own stdout. To start shipping:

1. Create the credentials (any OTLP backend — Grafana Cloud, Honeycomb,
   New Relic, Dash0):

   ```sh
   kubectl create secret generic otlp-backend -n observability \
     --from-literal=endpoint='otlp-gateway-prod-eu-west-2.grafana.net:443' \
     --from-literal=auth='Basic <base64 instanceID:token>'
   ```

   Prefer an **EU region**. Traces and access logs carry child UUIDs in URL
   paths and tenant IDs, so this is personal data under GDPR. Several vendors
   treat EU and US as separate accounts that cannot be migrated later.

2. Uncomment `otlp/backend` in `otel-collector-config.yaml` and add it to the
   `exporters` list of each pipeline.
3. Uncomment the two `OTLP_BACKEND_*` env vars in
   `otel-collector-deployment.yaml`.

The ConfigMaps are generated with a content hash, so editing a config rolls the
pods automatically.

## Finishing the SigNoz removal

Removing the ArgoCD `Application` does **not** delete what it deployed — it had
no `resources-finalizer.argocd.argoproj.io`, so ArgoCD prunes only the
`Application` object and leaves the workloads running. ClickHouse will keep
using ~2 GiB until the namespace is deleted by hand.

Order matters. The `ClickHouseInstallation` carries
`finalizer.clickhouseinstallation.altinity.com`; deleting the namespace first
removes the operator that processes that finalizer, and the namespace then
hangs in `Terminating` indefinitely.

```sh
# 1. Let the operator tear down ClickHouse while it is still running.
kubectl delete chi signoz-clickhouse -n signoz

# 2. Then remove everything else, including the PVCs.
kubectl delete namespace signoz
```

This **permanently deletes** three DigitalOcean block volumes (20Gi ClickHouse,
8Gi ZooKeeper, 1Gi SigNoz) holding roughly a year of telemetry. Export anything
worth keeping first.
