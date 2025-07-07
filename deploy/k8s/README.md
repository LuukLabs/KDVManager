# KDVManager Kubernetes Deployment

This directory contains the production-ready Kubernetes deployment configurations for the KDVManager application, optimized for **ArgoCD GitOps** deployment.

## Architecture Overview

The application consists of:
- **Web Frontend**: React/TypeScript application (3 replicas)
- **API Gateway**: Envoy proxy for routing (2 replicas)
- **CRM API**: Customer Relationship Management service (2 replicas)
- **Scheduling API**: Scheduling management service (2 replicas)
- **Database**: PostgreSQL (managed separately)

## GitOps with ArgoCD

This deployment is designed for **ArgoCD GitOps** workflows:
- ✅ **Kustomization**: Proper resource ordering and management
- ✅ **Sync Waves**: Controlled deployment sequence
- ✅ **Self-Healing**: Automatic drift detection and correction
- ✅ **Automated Sync**: Continuous deployment from Git
- ✅ **Rollback**: Easy rollback to previous versions

## Prerequisites

- Kubernetes cluster (1.21+)
- **ArgoCD** installed and configured
- **nginx-ingress-controller** installed
- **Metrics server** installed (for autoscaling)
- Git repository accessible by ArgoCD

**Note**: SSL certificates are currently disabled. The application will be accessible via HTTP only.

## Quick Start with ArgoCD

1. **Deploy via ArgoCD:**
   ```bash
   ./argocd-deploy.sh
   ```

2. **Monitor ArgoCD application:**
   ```bash
   ./argocd-health-check.sh
   ```

3. **Access ArgoCD UI:**
   ```bash
   kubectl port-forward svc/argocd-server -n argocd 8080:443
   # Open https://localhost:8080
   ```

## ArgoCD Application Configuration

The ArgoCD application is configured with:
- **Auto-sync**: Enabled with self-healing
- **Sync Policy**: Prune unused resources
- **Retry Policy**: 5 attempts with exponential backoff
- **Namespace**: Auto-create `kdvmanager-prod`

## Files Structure

```
k8s/
├── deploy.sh                          # Main deployment script
├── rollback.sh                        # Rollback script
├── namespace.yml                      # Namespace definition
├── pod-disruption-budgets.yml         # High availability configuration
├── network-policies.yml               # Network security policies
├── horizontal-pod-autoscaler.yml      # Auto-scaling configuration
├── monitoring.yml                     # Monitoring and logging setup
├── crm/
│   ├── deployment.yml                 # CRM API deployment
│   └── service.yml                    # CRM API service
├── scheduling/
│   ├── deployment.yml                 # Scheduling API deployment
│   └── service.yml                    # Scheduling API service
├── web/
│   ├── deployment.yml                 # Web frontend deployment
│   └── service.yml                    # Web frontend service
├── envoy/
│   ├── deployment.yml                 # Envoy proxy deployment
│   ├── service.yml                    # Envoy proxy service
│   ├── ingress.yml                    # Ingress configuration
│   └── loadbalancer.yml.backup        # Backup LoadBalancer config
└── letsencrypt/
    ├── production_issuer.yml          # Production SSL issuer
    └── staging_issuer.yml             # Staging SSL issuer
```

## Production Features

### Security
- ✅ Non-root containers
- ✅ Security contexts applied
- ✅ Network policies implemented
- ✅ SSL/TLS termination
- ✅ Rate limiting on ingress

### High Availability
- ✅ Multiple replicas for all services
- ✅ Pod disruption budgets
- ✅ Rolling updates with zero downtime
- ✅ Health checks (liveness/readiness probes)

### Scalability
- ✅ Horizontal Pod Autoscaler (HPA)
- ✅ Resource limits and requests
- ✅ CPU and memory-based scaling

### Monitoring
- ✅ Prometheus ServiceMonitor
- ✅ Logging configuration
- ✅ Health check endpoints

## Manual Deployment Steps

If you prefer to deploy manually:

1. **Create namespace:**
   ```bash
   kubectl apply -f namespace.yml
   ```

2. **Deploy certificate issuers:**
   ```bash
   kubectl apply -f letsencrypt/
   ```

3. **Deploy services:**
   ```bash
   kubectl apply -f web/
   kubectl apply -f crm/
   kubectl apply -f scheduling/
   kubectl apply -f envoy/
   ```

4. **Apply security and scaling policies:**
   ```bash
   kubectl apply -f pod-disruption-budgets.yml
   kubectl apply -f network-policies.yml
   kubectl apply -f horizontal-pod-autoscaler.yml
   ```

5. **Configure monitoring:**
   ```bash
   kubectl apply -f monitoring.yml
   ```

## Troubleshooting

### Common Issues

1. **Pods not starting:**
   ```bash
   kubectl describe pods -n kdvmanager-prod
   kubectl logs -f deployment/web -n kdvmanager-prod
   ```

2. **SSL certificate issues:**
   ```bash
   kubectl get certificates -n kdvmanager-prod
   kubectl describe certificate kdvmanager-nl-tls -n kdvmanager-prod
   ```

3. **Ingress not working:**
   ```bash
   kubectl get ingress -n kdvmanager-prod
   kubectl describe ingress kdvmanager-ingress -n kdvmanager-prod
   ```

### Rollback

If you need to rollback a deployment:
```bash
./rollback.sh
```

Or manually:
```bash
kubectl rollout undo deployment/web -n kdvmanager-prod
kubectl rollout status deployment/web -n kdvmanager-prod
```

## Scaling

### Manual Scaling
```bash
kubectl scale deployment web --replicas=5 -n kdvmanager-prod
```

### Auto-scaling Configuration
The HPA is configured to scale based on:
- CPU utilization: 70%
- Memory utilization: 80%

Scaling limits:
- Web: 3-10 replicas
- APIs: 2-8 replicas
- Envoy: 2-5 replicas

## Monitoring

### Check Resource Usage
```bash
kubectl top pods -n kdvmanager-prod
kubectl top nodes
```

### Check Autoscaling Status
```bash
kubectl get hpa -n kdvmanager-prod
kubectl describe hpa web-hpa -n kdvmanager-prod
```

## Security Notes

- All containers run as non-root users
- Network policies restrict communication between pods
- SSL certificates are automatically managed by cert-manager
- Rate limiting is enabled on the ingress controller
- Pod security contexts prevent privilege escalation

## Backup and Recovery

### Database Backup
Ensure your PostgreSQL database has regular backups configured.

### Configuration Backup
All Kubernetes configurations are version-controlled in this repository.

### Disaster Recovery
1. Deploy to a new cluster using `./deploy.sh`
2. Restore database from backup
3. Update DNS to point to new cluster

## Updates and Maintenance

### Rolling Updates
All deployments are configured for rolling updates with zero downtime.

### Container Updates
Update image tags in deployment files and apply:
```bash
kubectl apply -f web/deployment.yml
kubectl rollout status deployment/web -n kdvmanager-prod
```

### Maintenance Windows
For major updates, consider:
1. Scale down non-essential services
2. Update core services during low traffic
3. Monitor application performance post-update

## Support

For issues or questions:
1. Check pod logs: `kubectl logs -f deployment/SERVICE -n kdvmanager-prod`
2. Check events: `kubectl get events -n kdvmanager-prod --sort-by=.metadata.creationTimestamp`
3. Review this documentation
4. Contact the development team
