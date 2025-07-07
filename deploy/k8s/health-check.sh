#!/bin/bash

# KDVManager Health Check Script
# This script performs comprehensive health checks on the deployed application

set -e

echo "🏥 KDVManager Health Check"
echo "=========================="
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
    elif [ "$status" == "WARNING" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
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

# Check if namespace exists
if ! kubectl get namespace kdvmanager-prod &> /dev/null; then
    print_status "ERROR" "Namespace kdvmanager-prod does not exist"
    exit 1
fi

echo "🔍 Checking Deployments..."
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
            print_status "ERROR" "$deployment: $ready_replicas/$desired_replicas replicas ready"
        fi
    else
        print_status "ERROR" "$deployment: Deployment not found"
    fi
done

echo ""
echo "🌐 Checking Services..."
echo "----------------------"

# Check each service
services=("web" "crm-api" "scheduling-api" "envoy")

for service in "${services[@]}"; do
    if kubectl get service $service -n kdvmanager-prod &> /dev/null; then
        endpoints=$(kubectl get endpoints $service -n kdvmanager-prod -o jsonpath='{.subsets[0].addresses[*].ip}' | wc -w)
        if [ "$endpoints" -gt 0 ]; then
            print_status "OK" "$service: $endpoints endpoints available"
        else
            print_status "ERROR" "$service: No endpoints available"
        fi
    else
        print_status "ERROR" "$service: Service not found"
    fi
done

echo ""
echo "🔒 Checking Ingress..."
echo "---------------------"

if kubectl get ingress kdvmanager-ingress -n kdvmanager-prod &> /dev/null; then
    # Check if ingress has IP
    ingress_ip=$(kubectl get ingress kdvmanager-ingress -n kdvmanager-prod -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    if [ -n "$ingress_ip" ]; then
        print_status "OK" "Ingress IP: $ingress_ip"
    else
        print_status "WARNING" "Ingress IP not assigned yet"
    fi
    
    # Check TLS certificate
    tls_secret=$(kubectl get ingress kdvmanager-ingress -n kdvmanager-prod -o jsonpath='{.spec.tls[0].secretName}')
    if kubectl get secret $tls_secret -n kdvmanager-prod &> /dev/null; then
        print_status "OK" "TLS certificate available"
    else
        print_status "WARNING" "TLS certificate not ready"
    fi
else
    print_status "ERROR" "Ingress not found"
fi

echo ""
echo "📊 Checking Autoscaling..."
echo "-------------------------"

# Check HPA
hpas=("web-hpa" "crm-api-hpa" "scheduling-api-hpa" "envoy-hpa")

for hpa in "${hpas[@]}"; do
    if kubectl get hpa $hpa -n kdvmanager-prod &> /dev/null; then
        current_replicas=$(kubectl get hpa $hpa -n kdvmanager-prod -o jsonpath='{.status.currentReplicas}')
        desired_replicas=$(kubectl get hpa $hpa -n kdvmanager-prod -o jsonpath='{.status.desiredReplicas}')
        
        if [ "$current_replicas" == "$desired_replicas" ]; then
            print_status "OK" "$hpa: $current_replicas replicas (stable)"
        else
            print_status "WARNING" "$hpa: Scaling from $current_replicas to $desired_replicas"
        fi
    else
        print_status "ERROR" "$hpa: HPA not found"
    fi
done

echo ""
echo "🏥 Checking Pod Health..."
echo "------------------------"

# Check pod health
pods=$(kubectl get pods -n kdvmanager-prod -o jsonpath='{.items[*].metadata.name}')

for pod in $pods; do
    status=$(kubectl get pod $pod -n kdvmanager-prod -o jsonpath='{.status.phase}')
    ready=$(kubectl get pod $pod -n kdvmanager-prod -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}')
    
    if [ "$status" == "Running" ] && [ "$ready" == "True" ]; then
        print_status "OK" "$pod: Running and Ready"
    elif [ "$status" == "Running" ] && [ "$ready" == "False" ]; then
        print_status "WARNING" "$pod: Running but not Ready"
    else
        print_status "ERROR" "$pod: $status"
    fi
done

echo ""
echo "🔍 Resource Usage..."
echo "-------------------"

# Check resource usage if metrics-server is available
if kubectl top nodes &> /dev/null; then
    echo "Node Resource Usage:"
    kubectl top nodes
    echo ""
    echo "Pod Resource Usage:"
    kubectl top pods -n kdvmanager-prod
else
    print_status "WARNING" "Metrics server not available - cannot show resource usage"
fi

echo ""
echo "📋 Summary..."
echo "-------------"

# Count healthy deployments
healthy_deployments=0
total_deployments=${#deployments[@]}

for deployment in "${deployments[@]}"; do
    if kubectl get deployment $deployment -n kdvmanager-prod &> /dev/null; then
        ready_replicas=$(kubectl get deployment $deployment -n kdvmanager-prod -o jsonpath='{.status.readyReplicas}')
        desired_replicas=$(kubectl get deployment $deployment -n kdvmanager-prod -o jsonpath='{.spec.replicas}')
        
        if [ "$ready_replicas" == "$desired_replicas" ]; then
            ((healthy_deployments++))
        fi
    fi
done

echo "Healthy Deployments: $healthy_deployments/$total_deployments"

if [ $healthy_deployments -eq $total_deployments ]; then
    print_status "OK" "All systems healthy! 🎉"
    exit 0
else
    print_status "WARNING" "Some systems need attention"
    exit 1
fi
