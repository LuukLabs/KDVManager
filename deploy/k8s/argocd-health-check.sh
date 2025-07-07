#!/bin/bash

# ArgoCD Application Health Check Script
# This script checks the health of the ArgoCD-managed KDVManager application

set -e

echo "🏥 ArgoCD KDVManager Health Check"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    
    if [ "$status" == "OK" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" == "WARNING" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    elif [ "$status" == "INFO" ]; then
        echo -e "${BLUE}ℹ️  $message${NC}"
    else
        echo -e "${RED}❌ $message${NC}"
    fi
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_status "ERROR" "kubectl could not be found"
    exit 1
fi

# Check if we're connected to the cluster
if ! kubectl cluster-info &> /dev/null; then
    print_status "ERROR" "Not connected to Kubernetes cluster"
    exit 1
fi

# Check if ArgoCD is installed
if ! kubectl get namespace argocd &> /dev/null; then
    print_status "ERROR" "ArgoCD namespace not found"
    exit 1
fi

echo "🔍 Checking ArgoCD Application..."
echo "--------------------------------"

# Check if ArgoCD application exists
if kubectl get application kdvmanager-prod -n argocd &> /dev/null; then
    print_status "OK" "ArgoCD application exists"
    
    # Get application details
    app_health=$(kubectl get application kdvmanager-prod -n argocd -o jsonpath='{.status.health.status}')
    app_sync=$(kubectl get application kdvmanager-prod -n argocd -o jsonpath='{.status.sync.status}')
    app_revision=$(kubectl get application kdvmanager-prod -n argocd -o jsonpath='{.status.sync.revision}')
    
    # Check health status
    if [ "$app_health" == "Healthy" ]; then
        print_status "OK" "Application Health: $app_health"
    else
        print_status "WARNING" "Application Health: $app_health"
    fi
    
    # Check sync status
    if [ "$app_sync" == "Synced" ]; then
        print_status "OK" "Application Sync: $app_sync"
    else
        print_status "WARNING" "Application Sync: $app_sync"
    fi
    
    print_status "INFO" "Git Revision: ${app_revision:0:8}"
    
else
    print_status "ERROR" "ArgoCD application not found"
    exit 1
fi

echo ""
echo "🎯 Checking Application Resources..."
echo "-----------------------------------"

# Check if target namespace exists
if kubectl get namespace kdvmanager-prod &> /dev/null; then
    print_status "OK" "Target namespace exists"
    
    # Get resource summary
    resources=$(kubectl get application kdvmanager-prod -n argocd -o jsonpath='{.status.resources}')
    
    if [ -n "$resources" ]; then
        # Count resources by status
        healthy_count=$(echo "$resources" | grep -o '"status":"Synced"' | wc -l)
        total_count=$(echo "$resources" | grep -o '"kind":' | wc -l)
        
        print_status "INFO" "Managed Resources: $total_count"
        print_status "INFO" "Synced Resources: $healthy_count"
        
        if [ "$healthy_count" -eq "$total_count" ]; then
            print_status "OK" "All resources are synced"
        else
            print_status "WARNING" "Some resources are not synced"
        fi
    fi
    
else
    print_status "ERROR" "Target namespace does not exist"
fi

echo ""
echo "🚀 Checking Deployments..."
echo "-------------------------"

# Check each deployment
deployments=("web" "crm-api" "scheduling-api" "envoy")

for deployment in "${deployments[@]}"; do
    if kubectl get deployment $deployment -n kdvmanager-prod &> /dev/null; then
        ready_replicas=$(kubectl get deployment $deployment -n kdvmanager-prod -o jsonpath='{.status.readyReplicas}')
        desired_replicas=$(kubectl get deployment $deployment -n kdvmanager-prod -o jsonpath='{.spec.replicas}')
        
        if [ "$ready_replicas" == "$desired_replicas" ]; then
            print_status "OK" "$deployment: $ready_replicas/$desired_replicas replicas ready"
        else
            print_status "WARNING" "$deployment: $ready_replicas/$desired_replicas replicas ready"
        fi
    else
        print_status "ERROR" "$deployment: Not found"
    fi
done

echo ""
echo "📊 ArgoCD Application Details..."
echo "-------------------------------"

# Show detailed application information
kubectl get application kdvmanager-prod -n argocd -o yaml | grep -A 20 "status:" | head -20

echo ""
echo "🔄 Recent Sync History..."
echo "------------------------"

# Show operation history if available
if kubectl get application kdvmanager-prod -n argocd -o jsonpath='{.status.operationState}' | grep -q "operation"; then
    last_sync=$(kubectl get application kdvmanager-prod -n argocd -o jsonpath='{.status.operationState.finishedAt}')
    sync_result=$(kubectl get application kdvmanager-prod -n argocd -o jsonpath='{.status.operationState.phase}')
    
    print_status "INFO" "Last Sync: $last_sync"
    print_status "INFO" "Sync Result: $sync_result"
fi

echo ""
echo "📋 Summary and Recommendations..."
echo "--------------------------------"

# Overall health assessment
if [ "$app_health" == "Healthy" ] && [ "$app_sync" == "Synced" ]; then
    print_status "OK" "Application is healthy and synced! 🎉"
    
    echo ""
    echo "🔧 Useful ArgoCD Commands:"
    echo "  kubectl get application kdvmanager-prod -n argocd"
    echo "  kubectl describe application kdvmanager-prod -n argocd"
    
    if command -v argocd &> /dev/null; then
        echo "  argocd app get kdvmanager-prod"
        echo "  argocd app sync kdvmanager-prod"
        echo "  argocd app history kdvmanager-prod"
        echo "  argocd app rollback kdvmanager-prod"
    fi
    
    exit 0
else
    print_status "WARNING" "Application needs attention"
    
    echo ""
    echo "🛠️  Troubleshooting Steps:"
    echo "1. Check ArgoCD application logs"
    echo "2. Verify Git repository accessibility"
    echo "3. Check resource quotas and permissions"
    echo "4. Review sync policy configuration"
    
    if [ "$app_sync" != "Synced" ]; then
        echo "5. Force sync: kubectl patch application kdvmanager-prod -n argocd -p '{\"operation\":{\"sync\":{\"prune\":true}}}' --type=merge"
    fi
    
    exit 1
fi
