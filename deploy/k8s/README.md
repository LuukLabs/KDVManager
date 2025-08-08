# KDVManager Kubernetes Deployment

This directory contains the Kubernetes manifests for deploying KDVManager in production using ArgoCD and Kustomize.

## Structure

```
k8s/
├── namespaces/                 # Namespace definitions
│   ├── kdvmanager-prod.yaml  # Main application namespace
│   ├── observability.yaml    # Observability stack namespace
│   ├── cert-manager.yaml     # Certificate management namespace
│   └── kustomization.yaml
├── certificate-management/    # Certificate and TLS management
│   ├── letsencrypt/          # Let's Encrypt ClusterIssuers
│   └── kustomization.yaml
├── infrastructure/            # Infrastructure components
│   ├── secrets/              # Sealed secrets and secrets management
│   ├── envoy/                # API Gateway/Proxy
│   ├── rabbitmq/             # Message broker
│   └── kustomization.yaml
├── applications/             # Application services
│   ├── crm/                  # CRM service
│   ├── scheduling/           # Scheduling service
│   ├── web/                  # Web frontend
│   ├── data-migration/       # Data migration jobs
│   └── kustomization.yaml
├── observability/            # Observability stack
│   ├── otel-collector-config.yaml
│   ├── otel-collector-deployment.yaml
│   ├── otel-collector-service.yaml
│   ├── otel-collector-servicemonitor.yaml
│   └── kustomization.yaml
└── kustomization.yaml        # Root kustomization
```

## ArgoCD Deployment

The deployment uses ArgoCD sync waves for proper ordering:

1. **Wave -10**: Namespaces
2. **Wave -1**: ConfigMaps and Secrets
3. **Wave 0**: Deployments and Services
4. **Wave 1**: ServiceMonitors and additional resources

## Observability Stack

The observability stack includes:

- **OpenTelemetry Collector**: Collects traces, metrics, and logs
- **Health checks**: Built-in health checking
- **Prometheus metrics**: Exposed on port 8889
- **ServiceMonitor**: For Prometheus scraping

### Configuration

The OTel Collector is configured to:
- Accept OTLP gRPC (port 4317) and HTTP (port 4318)
- Process telemetry with resource attribution
- Export to external observability platforms
- Expose Prometheus metrics

## Usage

### Deploy with ArgoCD

Create an ArgoCD Application pointing to this directory:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: kdvmanager
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/LuukLabs/KDVManager
    targetRevision: main
    path: deploy/k8s
  destination:
    server: https://kubernetes.default.svc
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

### Deploy with kubectl

```bash
kubectl apply -k deploy/k8s
```

## Configuration

### OTel Collector Endpoint

Applications should send telemetry to:
- gRPC: `http://otel-collector.observability.svc.cluster.local:4317`
- HTTP: `http://otel-collector.observability.svc.cluster.local:4318`

### External Observability

Update the OTel Collector configuration to point to your external observability platform:

```yaml
exporters:
  otlp:
    endpoint: "your-external-endpoint:4317"
    headers:
      api-key: "your-api-key"
```
