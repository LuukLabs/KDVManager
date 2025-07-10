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

log "Refreshing KDVManager images..."

# Force image pull by restarting deployments
log "Restarting deployments to force image pulls..."
kubectl rollout restart deployment/crm-api -n "$NAMESPACE"
kubectl rollout status deployment/crm-api -n "$NAMESPACE" --timeout=300s

kubectl rollout restart deployment/scheduling-api -n "$NAMESPACE"
kubectl rollout status deployment/scheduling-api -n "$NAMESPACE" --timeout=300s

kubectl rollout restart deployment/web -n "$NAMESPACE"
kubectl rollout status deployment/web -n "$NAMESPACE" --timeout=300s

kubectl rollout restart deployment/envoy -n "$NAMESPACE"
kubectl rollout status deployment/envoy -n "$NAMESPACE" --timeout=300s

log "Waiting for rollouts to complete..."

log_success "All deployments refreshed successfully!"

# Show current pod status
log "Current pod status:"
kubectl get pods -n "$NAMESPACE" -o wide
