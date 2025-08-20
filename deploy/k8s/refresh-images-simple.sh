#!/bin/bash

# Simple ArgoCD image refresh script for KDVManager
# This is a lightweight version that works without ArgoCD CLI

set -e

NAMESPACE="kdvmanager-prod"

# Function to display help
print_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help        Show this help message and exit"
    echo "  --only SERVICE    Only refresh the specified service"
    echo ""
    echo "Available services: web, crm-api, scheduling-api, envoy, data-migration"
    echo ""
    echo "Examples:"
    echo "  $0                    # Refresh all services"
    echo "  $0 --only web         # Only refresh web service"
    echo "  $0 --only crm-api     # Only refresh crm-api service"
    exit 0
}

# Parse command line arguments
ONLY_SERVICE=""
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            print_help
            ;;
        --only)
            ONLY_SERVICE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

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

# Function to restart a specific service
restart_service() {
    local service=$1
    case $service in
        crm-api)
            log "Restarting crm-api deployment..."
            kubectl rollout restart deployment/crm-api -n "$NAMESPACE"
            kubectl rollout status deployment/crm-api -n "$NAMESPACE" --timeout=300s
            ;;
        scheduling-api)
            log "Restarting scheduling-api deployment..."
            kubectl rollout restart deployment/scheduling-api -n "$NAMESPACE"
            kubectl rollout status deployment/scheduling-api -n "$NAMESPACE" --timeout=300s
            ;;
        web)
            log "Restarting web deployment..."
            kubectl rollout restart deployment/web -n "$NAMESPACE"
            kubectl rollout status deployment/web -n "$NAMESPACE" --timeout=300s
            ;;
        envoy)
            log "Restarting envoy deployment..."
            kubectl rollout restart deployment/envoy -n "$NAMESPACE"
            kubectl rollout status deployment/envoy -n "$NAMESPACE" --timeout=300s
            ;;
        data-migration)
            log "Refreshing data-migration cronjob to force image pull..."
            kubectl patch cronjob data-migration-cronjob \
              -n "$NAMESPACE" \
              -p "{\"spec\": {\"jobTemplate\": {\"metadata\": {\"annotations\": {\"kubectl.kubernetes.io/restartedAt\": \"$(date +%FT%T%z)\"}}}}}"
            
            log "Running data-migration cronjob immediately..."
            kubectl create job --from=cronjob/data-migration-cronjob data-migration-manual-$(date +%s) -n "$NAMESPACE"
            ;;
        *)
            echo "Error: Unknown service '$service'"
            echo "Available services: web, crm-api, scheduling-api, envoy, data-migration"
            exit 1
            ;;
    esac
}

log "Starting KDVManager image refresh process..."

if [ -n "$ONLY_SERVICE" ]; then
    log "Refreshing only: $ONLY_SERVICE"
    restart_service "$ONLY_SERVICE"
    log_success "Service $ONLY_SERVICE refreshed successfully!"
else
    log "Refreshing all services..."
    restart_service "crm-api"
    restart_service "scheduling-api"
    restart_service "web"
    restart_service "envoy"
    restart_service "data-migration"
    log_success "All deployments and the data-migration cronjob refreshed and triggered successfully!"
fi

# Show current pod and cronjob status
log "Current pod status:"
kubectl get pods -n "$NAMESPACE" -o wide

if [ -z "$ONLY_SERVICE" ] || [ "$ONLY_SERVICE" = "data-migration" ]; then
    log "Current cronjob status:"
    kubectl get cronjobs -n "$NAMESPACE"
fi
