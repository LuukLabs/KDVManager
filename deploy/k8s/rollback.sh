#!/bin/bash

# KDVManager Rollback Script
# This script helps rollback deployments if issues occur

set -e

echo "🔄 KDVManager Rollback Script"
echo "This script will help you rollback deployments if needed."
echo ""

# Function to rollback a deployment
rollback_deployment() {
    local deployment_name=$1
    local namespace=$2
    
    echo "🔄 Rolling back $deployment_name..."
    kubectl rollout undo deployment/$deployment_name -n $namespace
    kubectl rollout status deployment/$deployment_name -n $namespace
}

# Check if we're connected to the cluster
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Not connected to Kubernetes cluster. Please configure kubectl."
    exit 1
fi

# Check if namespace exists
if ! kubectl get namespace kdvmanager-prod &> /dev/null; then
    echo "❌ Namespace kdvmanager-prod does not exist."
    exit 1
fi

echo "Available deployments:"
kubectl get deployments -n kdvmanager-prod

echo ""
echo "Select rollback option:"
echo "1) Rollback web deployment"
echo "2) Rollback crm-api deployment"
echo "3) Rollback scheduling-api deployment"
echo "4) Rollback envoy deployment"
echo "5) Rollback all deployments"
echo "6) Exit"

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        rollback_deployment "web" "kdvmanager-prod"
        ;;
    2)
        rollback_deployment "crm-api" "kdvmanager-prod"
        ;;
    3)
        rollback_deployment "scheduling-api" "kdvmanager-prod"
        ;;
    4)
        rollback_deployment "envoy" "kdvmanager-prod"
        ;;
    5)
        echo "🔄 Rolling back all deployments..."
        rollback_deployment "web" "kdvmanager-prod"
        rollback_deployment "crm-api" "kdvmanager-prod"
        rollback_deployment "scheduling-api" "kdvmanager-prod"
        rollback_deployment "envoy" "kdvmanager-prod"
        ;;
    6)
        echo "👋 Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo "✅ Rollback completed!"
echo ""
echo "🔍 Check status with:"
echo "  kubectl get pods -n kdvmanager-prod"
echo "  kubectl get deployments -n kdvmanager-prod"
