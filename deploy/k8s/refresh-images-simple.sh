#!/bin/bash

# Simple ArgoCD image refresh script for KDVManager
# This is a lightweight version that works without ArgoCD CLI

set -e

NAMESPACE="kdvmanager-prod"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log "Starting KDVManager image refresh process..."

log "Restarting crm-api deployment..."
kubectl rollout restart deployment/crm-api -n "$NAMESPACE"
kubectl rollout status deployment/crm-api -n "$NAMESPACE" --timeout=300s

log "Restarting scheduling-api deployment..."
kubectl rollout restart deployment/scheduling-api -n "$NAMESPACE"
kubectl rollout status deployment/scheduling-api -n "$NAMESPACE" --timeout=300s

log "Restarting web deployment..."
kubectl rollout restart deployment/web -n "$NAMESPACE"
kubectl rollout status deployment/web -n "$NAMESPACE" --timeout=300s

log "Restarting envoy deployment..."
kubectl rollout restart deployment/envoy -n "$NAMESPACE"
kubectl rollout status deployment/envoy -n "$NAMESPACE" --timeout=300s

log "Refreshing data-migration cronjob to force image pull..."
kubectl patch cronjob data-migration-cronjob \
  -n "$NAMESPACE" \
  -p "{\"spec\": {\"jobTemplate\": {\"metadata\": {\"annotations\": {\"kubectl.kubernetes.io/restartedAt\": \"$(date +%FT%T%z)\"}}}}}"

log "Running data-migration cronjob immediately..."
kubectl create job --from=cronjob/data-migration-cronjob data-migration-manual-$(date +%s) -n "$NAMESPACE"

log "Waiting for all rollouts and jobs to complete..."

log_success "All deployments and the data-migration cronjob refreshed and triggered successfully!"

# Show current pod and cronjob status
log "Current pod status:"
kubectl get pods -n "$NAMESPACE" -o wide
log "Current cronjob status:"
kubectl get cronjobs -n "$NAMESPACE"
