# SSL Certificates - Currently Disabled

SSL certificates have been disabled for this deployment. The application will be accessible via HTTP only.

## What was disabled:

1. **Let's Encrypt ClusterIssuers** - Commented out in `kustomization.yml`
2. **TLS section in Ingress** - Removed from `envoy/ingress.yml`
3. **SSL redirect annotations** - Removed from ingress
4. **cert-manager dependency** - Removed from prerequisites

## Current Access URLs:

- **Web**: http://kdvmanager.nl
- **API**: http://api.kdvmanager.nl

## To re-enable SSL certificates:

1. **Install cert-manager** in your cluster:
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
   ```

2. **Uncomment Let's Encrypt issuers** in `kustomization.yml`:
   ```yaml
   resources:
     - letsencrypt/production_issuer.yml
     - letsencrypt/staging_issuer.yml
   ```

3. **Add TLS configuration** back to `envoy/ingress.yml`:
   ```yaml
   metadata:
     annotations:
       cert-manager.io/cluster-issuer: "letsencrypt-production"
       nginx.ingress.kubernetes.io/ssl-redirect: "true"
       nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
   spec:
     tls:
     - hosts:
       - kdvmanager.nl
       - api.kdvmanager.nl
       secretName: kdvmanager-nl-tls
   ```

4. **Update ArgoCD application** to include letsencrypt directory:
   ```yaml
   directory:
     exclude: "*.backup"  # Remove letsencrypt exclusion
   ```

5. **Commit and push** changes to trigger ArgoCD sync.
