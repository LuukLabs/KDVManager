#!/bin/bash

# .NET Core optimized build script with aggressive caching

set -e

echo "Building .NET services with optimized caching..."

# Export BuildKit for better caching
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Build only the restore stage first to cache NuGet packages
echo "Step 1: Building restore stages (NuGet packages)..."
docker build --target restore -t kdvmanager-crm-restore . -f Services/CRM/Api/Dockerfile
docker build --target restore -t kdvmanager-scheduling-restore . -f Services/Scheduling/Api/Dockerfile
docker build --target restore -t kdvmanager-datamigration-restore . -f Services/DataMigration/Dockerfile

# Build complete images using cached restore stages
echo "Step 2: Building complete images (reusing cached packages)..."
docker-compose build --parallel crm-api scheduling-api data-migration

echo "✅ .NET build completed with optimized caching!"
echo ""
echo "Next builds will be much faster if:"
echo "  - Only source code changes (not project files)"
echo "  - NuGet packages don't change"
echo ""
echo "To force rebuild without cache:"
echo "  docker-compose build --no-cache"
