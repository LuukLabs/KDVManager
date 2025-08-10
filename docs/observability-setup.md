# Observability Stack - SigNoz & Error Collection

## Overview

Your KDVManager application now has a comprehensive observability stack with **SigNoz** deployed using the official Helm chart via ArgoCD, following SigNoz best practices, and **enhanced error collection** from .NET Core backends.

## Components

### 1. SigNoz APM Platform (Official Helm Chart)
- **Deployment**: Using official SigNoz Helm chart (v0.79.0) via ArgoCD
- **URL**: https://signoz.kdvmanager.nl (secured with basic auth)
- **Components**: 
  - SigNoz application server
  - ClickHouse database (included in Helm chart)
  - Zookeeper (included in Helm chart)
- **Features**: 
  - Distributed tracing
  - Application metrics
  - Error tracking and alerting
  - Service dependency mapping
  - Performance monitoring

### 2. OpenTelemetry Collector
- **Configuration**: `/deploy/k8s/observability/otel-collector-config.yaml`
- **Integration**: Connected to Helm-deployed SigNoz service
- **Exporters**: 
  - Jaeger (traces)
  - SigNoz (traces, metrics, logs) - `signoz-signoz.observability.svc.cluster.local:4317`
  - Prometheus (metrics)

### 3. Enhanced .NET Error Collection

#### Custom Metrics
Both CRM and Scheduling APIs now expose:
- `{service}_errors_total` - Counter of all errors by type
- `{service}_requests_total` - Counter of all requests
- `{service}_request_duration_seconds` - Request duration histogram

#### Structured Logging
- **Log Level**: Errors logged with appropriate levels (Warning for client errors, Error for server errors)
- **Context**: Each log includes TraceId, service name, request path, timestamp, and user context
- **Correlation**: Logs are correlated with OpenTelemetry traces

#### Error Enrichment
- **OpenTelemetry Spans**: Enhanced with error tags, status codes, and exception details
- **Stack Traces**: Full exception stack traces included in telemetry
- **Request Context**: Client IP, User Agent, request/response sizes included

## Deployment Architecture

### ArgoCD Application Approach
Following [SigNoz official ArgoCD documentation](https://signoz.io/docs/install/argocd/), the deployment uses:

```yaml
# signoz-application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: signoz
  namespace: argocd
spec:
  source:
    repoURL: https://charts.signoz.io
    targetRevision: 0.79.0
    chart: signoz
```

### Benefits of Official Helm Chart
- **Automatic Updates**: Easy version management through Helm chart versions
- **Official Support**: Direct support from SigNoz team
- **Best Practices**: Follows SigNoz recommended configurations
- **Component Management**: Handles ClickHouse, Zookeeper, and SigNoz coordination
- **Resource Optimization**: Proper resource requests and limits
- **High Availability**: Support for scaling and resilience patterns

## Configuration Details

### SigNoz Helm Values
```yaml
signoz:
  additionalArgs:
    - --use-logs-new-schema=true
    - --use-trace-new-schema=true
  resources:
    requests:
      memory: "512Mi"
      cpu: "250m"
    limits:
      memory: "1Gi"
      cpu: "500m"

clickhouse:
  resources:
    requests:
      memory: "1Gi"
      cpu: "500m"
    limits:
      memory: "2Gi"
      cpu: "1"
```

### Exception Handling Middleware
Location: `src/Services/{Service}/Api/Middleware/ExceptionHandlerMiddleware.cs`

Enhanced features:
- Custom metrics increment on errors
- Structured logging with correlation IDs
- OpenTelemetry span enrichment
- Detailed error context capture

### Telemetry Configuration
Location: `src/Services/{Service}/Api/ConfigureServices.cs`

Enhancements:
- Exception recording enabled
- Request/response enrichment
- Custom instrumentation
- OTLP exporter configuration

### Custom Metrics Classes
- `src/Services/CRM/Api/Telemetry/CrmApiMetrics.cs`
- `src/Services/Scheduling/Api/Telemetry/SchedulingApiMetrics.cs`

## Access URLs

1. **SigNoz Dashboard**: https://signoz.kdvmanager.nl
   - Username/Password: As configured in `auth-secret`
   
2. **Jaeger UI**: https://jaeger.kdvmanager.nl
   - Username/Password: As configured in `auth-secret`
   
3. **Prometheus**: https://prometheus.kdvmanager.nl
   - Username/Password: As configured in `auth-secret`

## Service Discovery

### SigNoz Services (Helm Chart)
- **Main Service**: `signoz-signoz.observability.svc.cluster.local:3301`
- **OTLP Endpoint**: `signoz-signoz.observability.svc.cluster.local:4317`
- **ClickHouse**: `signoz-clickhouse.observability.svc.cluster.local:9000`
- **Zookeeper**: `signoz-zookeeper.observability.svc.cluster.local:2181`

## Key Features for Error Tracking

### In SigNoz you can:
1. **Monitor Error Rates**: View error rates across services
2. **Trace Errors**: See full distributed traces for failed requests
3. **Error Alerting**: Set up alerts for error rate thresholds
4. **Service Maps**: Visualize service dependencies and error propagation
5. **Performance Impact**: Correlate errors with performance metrics

### Enhanced Error Context
Each error now includes:
- **Trace ID**: For correlation across distributed services
- **Service Name**: Origin service identification
- **Request Context**: Path, method, client info
- **Exception Details**: Type, message, stack trace
- **Custom Tags**: Service-specific error categorization

## Metrics Collection

### Automatic Metrics
- HTTP request/response metrics
- .NET runtime metrics (GC, memory, threading)
- Kubernetes cluster and pod metrics
- Database connection metrics

### Custom Metrics
- Error counters by type and service
- Request counters with status codes
- Request duration histograms
- Business-specific metrics (can be added per service)

## Log Collection

### Sources
- Application logs (via OpenTelemetry)
- Kubernetes pod logs
- Infrastructure logs
- Error logs with full context

### Format
All logs use structured JSON format with consistent fields:
- `timestamp`, `level`, `message`
- `service`, `traceId`, `spanId`
- `requestPath`, `requestMethod`
- Additional context fields

## Deployment Status

All components are deployed via ArgoCD with proper sync waves:
- SigNoz ArgoCD Application (wave 0)
- OTEL Collector and configurations (wave -1)
- Core services (wave 0)
- Ingress controllers (wave 1)

## Migration Steps (From Manual to Helm)

1. **Remove Old Resources**: The old manual SigNoz deployment files are no longer used
2. **Apply ArgoCD Application**: `kubectl apply -f signoz-application.yaml`
3. **Update OTEL Configuration**: Service endpoints updated to use Helm chart service names
4. **Verify Connectivity**: Check OTEL collector logs for successful connection to SigNoz

## Next Steps

1. **Configure Alerts**: Set up SigNoz alerts for error rates, response times
2. **Dashboards**: Create custom dashboards for business metrics
3. **Retention**: Configure data retention policies in ClickHouse
4. **Scaling**: Monitor resource usage and scale components as needed
5. **Version Updates**: Regularly update the Helm chart version in ArgoCD Application

## Troubleshooting

### Check SigNoz ArgoCD Application
```bash
kubectl get application signoz -n argocd
kubectl describe application signoz -n argocd
```

### Check SigNoz Status (Helm Deployment)
```bash
kubectl get pods -n observability | grep signoz
kubectl logs -n observability deployment/signoz-signoz
```

### Check OTEL Collector Connection
```bash
kubectl logs -n observability deployment/otel-collector | grep signoz
```

### Verify Service Discovery
```bash
kubectl get svc -n observability | grep signoz
nslookup signoz-signoz.observability.svc.cluster.local
```

## References

- [SigNoz ArgoCD Documentation](https://signoz.io/docs/install/argocd/)
- [SigNoz Helm Chart](https://github.com/SigNoz/charts)
- [ArgoCD Helm Support](https://argo-cd.readthedocs.io/en/stable/user-guide/helm/)

The observability stack is now fully operational using SigNoz official best practices with comprehensive error tracking and monitoring capabilities!
