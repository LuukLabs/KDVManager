# ArgoCD Troubleshooting Guide for KDVManager

This guide helps troubleshoot common issues when deploying KDVManager with ArgoCD.

## Common Issues and Solutions

### 1. Application Not Syncing

**Problem**: ArgoCD application shows "OutOfSync" status

**Solutions**:
```bash
# Check application status
kubectl describe application kdvmanager-prod -n argocd

# Force sync
kubectl patch application kdvmanager-prod -n argocd -p '{"operation":{"sync":{"prune":true}}}' --type=merge

# Or using ArgoCD CLI
argocd app sync kdvmanager-prod --force
```

### 2. Sync Waves Not Working

**Problem**: Resources are deployed in wrong order

**Check**:
- Ensure `argocd.argoproj.io/sync-wave` annotations are set
- Verify dependencies between resources
- Check ArgoCD controller logs

**Fix**:
```bash
# Add sync wave annotations
kubectl annotate application kdvmanager-prod -n argocd argocd.argoproj.io/sync-wave="1"
```

### 3. Certificate Issues

**Problem**: SSL certificates not being created

**Check**:
```bash
# Check certificate status
kubectl get certificates -n kdvmanager-prod
kubectl describe certificate kdvmanager-nl-tls -n kdvmanager-prod

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager
```

**Fix**:
- Ensure cert-manager is installed
- Verify ClusterIssuer is working
- Check DNS resolution

### 4. Ingress Not Working

**Problem**: Services not accessible through ingress

**Check**:
```bash
# Check ingress status
kubectl get ingress -n kdvmanager-prod
kubectl describe ingress kdvmanager-ingress -n kdvmanager-prod

# Check nginx-ingress logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

### 5. Application Health Issues

**Problem**: ArgoCD shows application as "Degraded"

**Check**:
```bash
# Check pod status
kubectl get pods -n kdvmanager-prod

# Check deployment status
kubectl get deployments -n kdvmanager-prod

# Check events
kubectl get events -n kdvmanager-prod --sort-by=.metadata.creationTimestamp
```

### 6. Resource Limits

**Problem**: Pods being killed due to resource constraints

**Check**:
```bash
# Check resource usage
kubectl top pods -n kdvmanager-prod
kubectl top nodes

# Check pod events
kubectl describe pod <pod-name> -n kdvmanager-prod
```

**Fix**:
- Adjust resource limits in deployment files
- Add more nodes to cluster
- Optimize application resource usage

### 7. Database Connection Issues

**Problem**: APIs cannot connect to PostgreSQL

**Check**:
```bash
# Check database pod
kubectl get pods -l app=postgres

# Check database service
kubectl get svc postgres-service

# Check connection strings in deployments
kubectl get deployment crm-api -o yaml | grep -A 5 -B 5 POSTGRES
```

### 8. ArgoCD Controller Issues

**Problem**: ArgoCD not processing application changes

**Check**:
```bash
# Check ArgoCD controller logs
kubectl logs -n argocd deployment/argocd-application-controller

# Check ArgoCD server logs
kubectl logs -n argocd deployment/argocd-server

# Restart ArgoCD components
kubectl rollout restart deployment/argocd-application-controller -n argocd
```

## Monitoring and Debugging

### ArgoCD Application Logs
```bash
# Get application sync logs
kubectl logs -n argocd deployment/argocd-application-controller | grep kdvmanager-prod

# Get detailed application info
argocd app get kdvmanager-prod --show-operation
```

### Resource Debugging
```bash
# Check all resources managed by ArgoCD
kubectl get all -n kdvmanager-prod

# Check resource annotations
kubectl get deployment web -n kdvmanager-prod -o yaml | grep annotations -A 10

# Check finalizers
kubectl get application kdvmanager-prod -n argocd -o yaml | grep finalizers -A 5
```

### Health Check Commands
```bash
# Run comprehensive health check
./argocd-health-check.sh

# Check specific deployment health
kubectl get deployment web -n kdvmanager-prod -o jsonpath='{.status.conditions[?(@.type=="Available")].status}'

# Check ingress health
kubectl get ingress kdvmanager-ingress -n kdvmanager-prod -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

## Recovery Procedures

### Complete Application Reset
```bash
# Delete application (this will remove all resources)
kubectl delete application kdvmanager-prod -n argocd

# Recreate application
kubectl apply -f argocd-application.yml

# Force sync
argocd app sync kdvmanager-prod --force
```

### Partial Resource Reset
```bash
# Delete specific resource
kubectl delete deployment web -n kdvmanager-prod

# ArgoCD will recreate it automatically due to self-healing
```

### Rollback to Previous Version
```bash
# Get application history
argocd app history kdvmanager-prod

# Rollback to specific revision
argocd app rollback kdvmanager-prod <revision-id>
```

## Best Practices

1. **Always test in staging** before production
2. **Monitor ArgoCD notifications** for sync failures
3. **Use health checks** to verify application status
4. **Keep Git repository clean** - avoid direct kubectl changes
5. **Use sync waves** for proper resource ordering
6. **Enable auto-sync** for continuous deployment
7. **Set up alerts** for application health issues

## Emergency Contacts

- **ArgoCD Documentation**: https://argo-cd.readthedocs.io/
- **Kubernetes Documentation**: https://kubernetes.io/docs/
- **cert-manager Documentation**: https://cert-manager.io/docs/

## Useful Commands Reference

```bash
# ArgoCD CLI commands
argocd app list
argocd app get kdvmanager-prod
argocd app sync kdvmanager-prod
argocd app history kdvmanager-prod
argocd app rollback kdvmanager-prod

# Kubernetes commands
kubectl get application kdvmanager-prod -n argocd
kubectl describe application kdvmanager-prod -n argocd
kubectl get pods -n kdvmanager-prod
kubectl logs -f deployment/web -n kdvmanager-prod

# Health check commands
./argocd-health-check.sh
kubectl get all -n kdvmanager-prod
kubectl top pods -n kdvmanager-prod
```
