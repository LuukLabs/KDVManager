#!/bin/bash

# ArgoCD Application Deployment Script
# This script creates and manages the ArgoCD application for KDVManager

set -e

echo "🚀 ArgoCD KDVManager Deployment Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_status "ERROR" "kubectl could not be found. Please install kubectl first."
    exit 1
fi

# Check if argocd CLI is available
if ! command -v argocd &> /dev/null; then
    print_status "INFO" "argocd CLI not found. You can install it from: https://argo-cd.readthedocs.io/en/stable/cli_installation/"
fi

# Check if we're connected to the cluster
if ! kubectl cluster-info &> /dev/null; then
    print_status "ERROR" "Not connected to Kubernetes cluster. Please configure kubectl."
    exit 1
fi

# Check if ArgoCD is installed
if ! kubectl get namespace argocd &> /dev/null; then
    print_status "ERROR" "ArgoCD namespace not found. Please install ArgoCD first."
    echo "Install ArgoCD with:"
    echo "kubectl create namespace argocd"
    echo "kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml"
    exit 1
fi

# Prompt for repository URL
read -p "Enter your Git repository URL (e.g., https://github.com/username/KDVManager.git): " repo_url

if [ -z "$repo_url" ]; then
    print_status "ERROR" "Repository URL is required"
    exit 1
fi

# Update the ArgoCD application with the correct repository URL
sed -i.bak "s|https://github.com/luukvh/KDVManager.git|$repo_url|g" argocd-application.yml

print_status "INFO" "Repository URL updated to: $repo_url"

# Apply the ArgoCD application
print_status "INFO" "Creating ArgoCD application..."
kubectl apply -f argocd-application.yml

# Wait for application to be created
print_status "INFO" "Waiting for ArgoCD application to be created..."
kubectl wait --for=condition=ready application/kdvmanager-prod -n argocd --timeout=60s

# Check application status
print_status "INFO" "Checking ArgoCD application status..."
kubectl get application kdvmanager-prod -n argocd

echo ""
print_status "OK" "ArgoCD application created successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Access ArgoCD UI to monitor deployment"
echo "2. Sync the application if not auto-syncing"
echo "3. Monitor application health and sync status"
echo ""
echo "🔍 Useful Commands:"
echo "  kubectl get application kdvmanager-prod -n argocd"
echo "  kubectl describe application kdvmanager-prod -n argocd"
echo ""
if command -v argocd &> /dev/null; then
    echo "  argocd app get kdvmanager-prod"
    echo "  argocd app sync kdvmanager-prod"
    echo "  argocd app history kdvmanager-prod"
fi

# Restore original file
mv argocd-application.yml.bak argocd-application.yml
