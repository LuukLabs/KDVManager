#!/bin/bash

# Script to build with optimal caching
# This script demonstrates best practices for Docker caching

set -e

echo "Building with Docker BuildKit and optimal caching..."

# Export required variables
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Pull latest images for cache_from to work
echo "Pulling latest images for cache optimization..."
docker-compose pull --ignore-pull-failures

# Build with cache optimization
echo "Building services with cache optimization..."
docker-compose build --parallel

echo "Build completed successfully!"
echo ""
echo "To run the application:"
echo "  docker-compose up"
echo ""
echo "To rebuild without cache (if needed):"
echo "  docker-compose build --no-cache"
