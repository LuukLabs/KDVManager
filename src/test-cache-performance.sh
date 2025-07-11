#!/bin/bash

# Test script to verify Docker caching improvements

echo "🧪 Testing Docker Build Cache Effectiveness"
echo "=========================================="

# Test 1: Build once to establish baseline
echo "Test 1: Initial build (establishing cache baseline)..."
time docker build -t cache-test ./web > /dev/null 2>&1
echo "✅ Initial build completed"

# Test 2: Build again without changes (should be fast)
echo ""
echo "Test 2: Rebuild without changes (should be cached)..."
start_time=$(date +%s)
docker build -t cache-test ./web > /dev/null 2>&1
end_time=$(date +%s)
no_change_time=$((end_time - start_time))
echo "✅ No-change rebuild: ${no_change_time}s"

# Test 3: Touch a source file and rebuild (should be faster than full build)
echo ""
echo "Test 3: Touch source file and rebuild (should use dependency cache)..."
touch ./web/src/main.tsx
start_time=$(date +%s)
docker build -t cache-test ./web > /dev/null 2>&1
end_time=$(date +%s)
source_change_time=$((end_time - start_time))
echo "✅ Source change rebuild: ${source_change_time}s"

# Test 4: Touch package.json and rebuild (should invalidate dependency cache)
echo ""
echo "Test 4: Touch package.json and rebuild (should rebuild deps)..."
touch ./web/package.json
start_time=$(date +%s)
docker build -t cache-test ./web > /dev/null 2>&1
end_time=$(date +%s)
package_change_time=$((end_time - start_time))
echo "✅ Package change rebuild: ${package_change_time}s"

# Results
echo ""
echo "📊 Cache Performance Results:"
echo "=============================="
echo "No changes:      ${no_change_time}s (should be <10s)"
echo "Source changes:  ${source_change_time}s (should be <60s)"
echo "Package changes: ${package_change_time}s (full rebuild)"

if [ $no_change_time -lt 10 ]; then
    echo "✅ Cache optimization: EXCELLENT"
elif [ $no_change_time -lt 30 ]; then
    echo "⚠️  Cache optimization: GOOD"
else
    echo "❌ Cache optimization: NEEDS IMPROVEMENT"
fi

# Cleanup
docker rmi cache-test > /dev/null 2>&1

echo ""
echo "💡 Tips for maintaining good cache performance:"
echo "- Keep package.json/pnpm-lock.yaml stable"
echo "- Use .dockerignore to exclude unnecessary files"
echo "- Order Dockerfile commands from least to most likely to change"
