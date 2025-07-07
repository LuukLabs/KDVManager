#!/bin/bash

# KDVManager ArgoCD-Compatible Deployment Script
# This script can be used for manual deployment or ArgoCD preview

set -e

echo "🚀 KDVManager Deployment Script (ArgoCD Compatible)"
echo "==================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    local status=$1
    local message=$2
    
    if [ "$status" == "OK" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" == "INFO" ]; then
        echo -e "${YELLOW}ℹ️  $message${NC}"
    else
        echo -e "${RED}❌ $message${NC}"
    fi
}

echo "📋 Deployment Options:"
echo "1) Deploy via ArgoCD (Recommended)"
echo "2) Manual deployment with kubectl"
echo "3) Preview resources with Kustomize"
echo "4) Exit"
echo ""

read -p "Choose deployment method (1-4): " choice

case $choice in
    1)
        print_status "INFO" "Starting ArgoCD deployment..."
        if [ -f "./argocd-deploy.sh" ]; then
            ./argocd-deploy.sh
        else
            print_status "ERROR" "ArgoCD deployment script not found"
            exit 1
        fi
        ;;
    2)
        print_status "INFO" "Starting manual deployment..."
        
        # Check if kubectl is available
        if ! command -v kubectl &> /dev/null; then
            print_status "ERROR" "kubectl could not be found. Please install kubectl first."
            exit 1
        fi

        # Check if we're connected to the cluster
        if ! kubectl cluster-info &> /dev/null; then
            print_status "ERROR" "Not connected to Kubernetes cluster. Please configure kubectl."
            exit 1
        fi

        # Check if kustomize is available
        if command -v kustomize &> /dev/null; then
            print_status "INFO" "Using Kustomize for deployment..."
            kustomize build . | kubectl apply -f -
        else
            print_status "INFO" "Using kubectl with individual files..."
            
            # Deploy in order of dependencies
            echo "📦 Creating namespace..."
            kubectl apply -f namespace.yml

            echo "🔒 Skipping Let's Encrypt certificate issuers (disabled)..."
            # kubectl apply -f letsencrypt/

            echo "🏗️  Deploying core services..."
            kubectl apply -f web/
            kubectl apply -f crm/
            kubectl apply -f scheduling/
            kubectl apply -f envoy/

            echo "🛡️  Applying security policies..."
            kubectl apply -f pod-disruption-budgets.yml
            kubectl apply -f network-policies.yml

            echo "📊 Setting up autoscaling..."
            kubectl apply -f horizontal-pod-autoscaler.yml

            echo "📈 Configuring monitoring..."
            kubectl apply -f monitoring.yml
        fi

        echo "⏳ Waiting for deployments to be ready..."
        kubectl wait --for=condition=available --timeout=300s deployment/web -n kdvmanager-prod
        kubectl wait --for=condition=available --timeout=300s deployment/crm-api -n kdvmanager-prod
        kubectl wait --for=condition=available --timeout=300s deployment/scheduling-api -n kdvmanager-prod
        kubectl wait --for=condition=available --timeout=300s deployment/envoy -n kdvmanager-prod

        print_status "OK" "Manual deployment completed successfully!"
        ;;
    3)
        print_status "INFO" "Previewing resources with Kustomize..."
        
        if command -v kustomize &> /dev/null; then
            kustomize build . | head -50
            echo "..."
            echo "(Output truncated - use 'kustomize build .' to see full output)"
        else
            print_status "ERROR" "Kustomize not found. Please install kustomize."
            exit 1
        fi
        ;;
    4)
        print_status "INFO" "Exiting..."
        exit 0
        ;;
    *)
        print_status "ERROR" "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📋 Deployment Summary:"
echo "  - Namespace: kdvmanager-prod"
echo "  - Web replicas: 3"
echo "  - CRM API replicas: 2"
echo "  - Scheduling API replicas: 2"
echo "  - Envoy replicas: 2"
echo "  - Autoscaling: Enabled"
echo "  - Security policies: Applied"
echo "  - Monitoring: Configured"
echo ""
echo "🌐 Access your application at:"
echo "  - Web: http://kdvmanager.nl (HTTP only - SSL disabled)"
echo "  - API: http://api.kdvmanager.nl (HTTP only - SSL disabled)"
echo ""
echo "🔍 Check status with:"
echo "  kubectl get pods -n kdvmanager-prod"
echo "  kubectl get ingress -n kdvmanager-prod"
echo "  kubectl get hpa -n kdvmanager-prod"
echo "  ./argocd-health-check.sh (if using ArgoCD)"
