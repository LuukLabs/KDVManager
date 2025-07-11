# Docker Build Cache Optimization

This document explains the Docker build cache optimizations implemented in the KDVManager project.

## Issues Fixed

### 1. Poor Layer Caching Strategy
**Problem**: The original Dockerfiles were copying all source code before installing dependencies, which invalidated the cache whenever any file changed.

**Solution**: Restructured Dockerfiles to follow the optimal layer order:
1. Copy package/project files first
2. Install/restore dependencies 
3. Copy source code
4. Build application

### 2. Missing BuildKit Configuration
**Problem**: The setup wasn't using Docker BuildKit, which provides better caching and build performance.

**Solution**: Added `.env` file with BuildKit configuration and updated docker-compose.yml with `cache_from` directives.

### 3. Suboptimal .dockerignore Files
**Problem**: .dockerignore files weren't excluding all build artifacts that could invalidate cache.

**Solution**: Enhanced .dockerignore files to exclude more build artifacts and temporary files.

## Key Improvements

### Web Application (Node.js)
- **Before**: Copied entire source code before `pnpm install`
- **After**: Copy `package.json` and `pnpm-lock.yaml` first, then install dependencies, then copy source code
- **Benefit**: Dependencies layer can be cached until package files change

### .NET Applications
- **Before**: Copied all source code after `dotnet restore`
- **After**: Copy project files first, restore dependencies, then copy source code
- **Benefit**: NuGet packages layer can be cached until project files change

### Docker Compose
- **Before**: Basic build configuration without cache optimization
- **After**: Added `cache_from` directives to use existing images as cache sources
- **Benefit**: Can reuse layers from previously built images

## Files Modified

1. **Dockerfiles optimized**:
   - `src/web/Dockerfile` - Node.js web application
   - `src/Services/CRM/Api/Dockerfile` - CRM API service
   - `src/Services/CRM/Infrastructure/Dockerfile` - CRM migrator
   - `src/Services/Scheduling/Api/Dockerfile` - Scheduling API service
   - `src/Services/Scheduling/Infrastructure/Dockerfile` - Scheduling migrator
   - `src/Services/DataMigration/Dockerfile` - Data migration service

2. **Configuration files**:
   - `src/.env` - Added BuildKit configuration
   - `src/docker-compose.yml` - Added cache_from directives
   - `src/.dockerignore` - Enhanced to exclude more build artifacts
   - `src/web/.dockerignore` - Enhanced for web-specific exclusions

3. **Build script**:
   - `src/build-with-cache.sh` - Script for optimal cache builds

## Usage

### Quick Build (Recommended)
```bash
cd src
./build-with-cache.sh
```

### Manual Build with Cache
```bash
cd src
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
docker-compose build --parallel
```

### Build Without Cache (if needed)
```bash
cd src
docker-compose build --no-cache
```

## Expected Performance Improvement

- **First build**: Similar time (need to pull base images and install dependencies)
- **Subsequent builds**: 
  - 70-90% faster when only source code changes
  - 50-70% faster when dependencies change
  - Near-instant when no relevant changes detected

## Best Practices for Maintaining Cache Efficiency

1. **Keep package/project files stable**: Only update dependencies when necessary
2. **Use .dockerignore effectively**: Exclude files that don't affect the build
3. **Leverage multi-stage builds**: Separate build dependencies from runtime
4. **Use specific base image tags**: Avoid `latest` tags for reproducible builds

## Troubleshooting

If builds are still slow:

1. Check if Docker BuildKit is enabled:
   ```bash
   docker buildx version
   ```

2. Verify cache is being used:
   ```bash
   docker-compose build --progress=plain
   ```

3. Clean Docker cache if corrupted:
   ```bash
   docker builder prune
   ```

4. Check available disk space (Docker cache requires space)

## Monitoring Cache Effectiveness

You can monitor cache hit rates by watching build logs for:
- `CACHED` messages for reused layers
- `RUN` messages for rebuilt layers
- Build time comparisons between first and subsequent builds
