# KDVManager Kustomize Configuration

This directory contains the complete Kustomize configuration for the KDVManager production deployment.

## Architecture Overview

```
deploy/k8s/
├── kustomization.yaml          # Root orchestration
├── namespace.yml              # Namespace definition
├── argocd-application.yml     # ArgoCD application config
├── crm/                       # CRM API service
│   ├── kustomization.yaml
│   ├── deployment.yml
│   └── service.yml
├── scheduling/                # Scheduling API service
│   ├── kustomization.yaml
│   ├── deployment.yml
│   └── service.yml
├── web/                       # Frontend web application
│   ├── kustomization.yaml
│   ├── deployment.yml
│   └── service.yml
├── envoy/                     # API Gateway (Envoy Proxy)
│   ├── kustomization.yaml
│   ├── deployment.yml
│   ├── service.yml
│   ├── ingress.yml
│   └── envoy.yaml            # Envoy configuration
├── data-migration/            # Data migration CronJob
│   ├── kustomization.yaml
│   └── cronjob.yml
├── secrets/                   # Secrets and ServiceAccount
│   ├── kustomization.yaml
│   ├── service-account.yml
│   ├── ghcr-secret.yaml
│   ├── kdvmanager-postgres-secret.yaml
│   └── mssql-source-secret.yaml
└── letsencrypt/              # TLS Certificate Issuers
    ├── kustomization.yaml
    ├── production_issuer.yml
    └── staging_issuer.yml
```

## Key Features

### 🔄 Automatic Pod Restarts
- **ConfigMap Hash Suffixes**: When Envoy configuration changes, pods restart automatically
- **Rolling Updates**: Zero-downtime deployments for all services
- **Configuration Versioning**: Each config change gets a unique hash for tracking

### 🏷️ Consistent Labeling
- **Hierarchical Labels**: Common labels applied at root + component-specific labels
- **Service Discovery**: Proper labeling for monitoring and service mesh integration
- **Resource Organization**: Clear separation of concerns with component labels

### 🔧 GitOps Integration
- **ArgoCD Compatible**: Native kustomize support in ArgoCD
- **Automated Sync**: Changes in git automatically deployed to cluster
- **Resource Management**: Proper pruning and lifecycle management

## Component Details

### Root Kustomization
- **Namespace Management**: Applies `kdvmanager-prod` to all resources
- **Common Labels**: Adds standard Kubernetes labels to all resources
- **Resource Orchestration**: Manages component dependencies and order

### Service Components
Each service (CRM, Scheduling, Web) includes:
- **Deployment**: Application workload configuration
- **Service**: Network exposure and service discovery
- **Labels**: Component-specific identification

### Infrastructure Components
- **Envoy**: API Gateway with automatic config reloads
- **Secrets**: Centralized secret management
- **Certificates**: Let's Encrypt TLS certificate automation
- **Data Migration**: Scheduled data synchronization jobs

## Usage

### Local Development
```bash
# Preview all generated manifests
kustomize build . --load-restrictor LoadRestrictionsNone

# Preview specific component
cd crm && kustomize build .

# Apply to cluster (development)
kustomize build . --load-restrictor LoadRestrictionsNone | kubectl apply -f -
```

### Production Deployment
Production deployment is managed by ArgoCD:
1. **Commit Changes**: Push changes to git repository
2. **ArgoCD Sync**: ArgoCD automatically detects and applies changes
3. **Monitoring**: Check ArgoCD UI for deployment status

### Configuration Updates

#### Envoy Configuration
1. Edit `envoy/envoy.yaml`
2. Commit and push changes
3. ArgoCD automatically redeploys with new configuration
4. Pods restart automatically due to ConfigMap hash change

#### Service Configuration
1. Edit deployment files in respective service directories
2. Labels and namespaces are applied automatically by kustomize
3. ArgoCD handles the deployment process

## Validation

### Pre-commit Validation
```bash
# Validate all manifests
kustomize build . --load-restrictor LoadRestrictionsNone | kubectl --dry-run=client apply -f -

# Check resource counts
kustomize build . --load-restrictor LoadRestrictionsNone | grep "^kind:" | sort | uniq -c

# Validate specific component
cd scheduling && kustomize build . | kubectl --dry-run=client apply -f -
```

### Resource Overview
- **4 Deployments**: CRM API, Scheduling API, Web, Envoy
- **4 Services**: Service discovery for all deployments
- **1 Ingress**: External traffic routing via Envoy
- **1 ConfigMap**: Envoy configuration (with hash suffix)
- **1 CronJob**: Data migration automation
- **3 Secrets**: Container registry, database credentials
- **1 ServiceAccount**: Pod security context
- **2 ClusterIssuers**: TLS certificate management

## Benefits

### Over Plain Manifests
1. **DRY Principle**: No repeated namespace/label declarations
2. **Automatic Restarts**: ConfigMap changes trigger pod restarts
3. **Consistent Organization**: Standardized structure across components
4. **Easier Maintenance**: Component isolation with shared configuration

### GitOps Workflow
1. **Declarative**: Complete infrastructure as code
2. **Auditable**: All changes tracked in git
3. **Rollback Capable**: Easy to revert to previous configurations
4. **Environment Consistency**: Same configuration patterns across environments

## Troubleshooting

### Common Issues
```bash
# Check kustomize build errors
kustomize build . --load-restrictor LoadRestrictionsNone

# Validate individual components
for dir in */; do echo "Validating $dir"; cd "$dir" && kustomize build . >/dev/null && echo "✅ Valid" || echo "❌ Invalid"; cd ..; done

# Check ArgoCD application status
kubectl get applications -n argocd

# Check generated ConfigMap names
kustomize build . --load-restrictor LoadRestrictionsNone | grep "name: envoy-config"
```

### Debug Commands
```bash
# Check resource differences
kustomize build . --load-restrictor LoadRestrictionsNone > current.yaml
kubectl get all -n kdvmanager-prod -o yaml > cluster.yaml
diff current.yaml cluster.yaml

# Monitor pod restarts
kubectl get pods -n kdvmanager-prod -w

# Check Envoy configuration loading
kubectl logs -n kdvmanager-prod -l app=envoy -f
```
