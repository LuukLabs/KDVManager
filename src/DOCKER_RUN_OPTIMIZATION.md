# Docker RUN Command Optimization Guide

## Ways to Skip RUN Commands

### 1. **Layer Caching (Automatic)**
Docker automatically skips RUN commands when layers are cached:

```dockerfile
# This RUN will be skipped if inputs haven't changed
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile  # ← Skipped if package files unchanged
```

### 2. **Multi-stage Build Optimization**
Reuse stages instead of repeating RUN commands:

```dockerfile
# ❌ BAD: Repeats pnpm install
FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ✅ GOOD: Reuses deps stage
FROM deps AS build
# pnpm install already done in deps stage
```

### 3. **Build Targets**
Build only specific stages:

```bash
# Build only the deps stage (skips build and final stages)
docker build --target deps -t myapp-deps .

# Build only up to build stage (skips final nginx stage)
docker build --target build -t myapp-build .

# Build everything (default)
docker build -t myapp .
```

### 4. **Conditional RUN Commands**
Use shell conditionals to skip commands:

```dockerfile
# Skip if file exists
RUN if [ ! -f "/app/setup-complete" ]; then \
      echo "Running setup..." && \
      npm run setup && \
      touch /app/setup-complete; \
    fi

# Skip based on environment
ARG SKIP_TESTS=false
RUN if [ "$SKIP_TESTS" != "true" ]; then npm test; fi
```

### 5. **External Cache Mounts**
Use cache mounts to persist data across builds:

```dockerfile
# Package manager cache persists across builds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

# Build cache persists
RUN --mount=type=cache,id=build,target=/app/.cache npm run build
```

## Your Current Dockerfile Optimizations

### Before (Inefficient):
```dockerfile
FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install  # ← Repeated work
```

### After (Optimized):
```dockerfile
FROM deps AS build  # ← Reuses deps stage, skips install
```

## Build Commands with Skipping

### Development Build (Skip production optimizations):
```bash
docker build --target development -t kdvmanager-dev .
```

### Production Build (Skip development stage):
```bash
docker build --target final -t kdvmanager-prod .
```

### Cache-only Build (Skip if cached):
```bash
docker build --cache-from kdvmanager-web:latest -t kdvmanager-web .
```

### Build with Arguments (Conditional skipping):
```bash
docker build --build-arg SKIP_TESTS=true -t kdvmanager-web .
```

## Performance Tips

1. **Order matters**: Put changing files last
2. **Use .dockerignore**: Exclude unnecessary files
3. **Multi-stage**: Share common stages
4. **Cache mounts**: Persist package manager caches
5. **Build targets**: Only build what you need

## Example: Conditional Development Tools

```dockerfile
FROM base AS dev-tools
ARG INSTALL_DEV_TOOLS=false
RUN if [ "$INSTALL_DEV_TOOLS" = "true" ]; then \
      pnpm install --dev && \
      pnpm install -g typescript @types/node; \
    fi

FROM base AS production
# Skip dev tools entirely
COPY --from=deps /app/node_modules ./node_modules
```

## Monitoring Skipped Commands

Check build logs for:
- `CACHED [stage X/Y]` - Layer was skipped (cached)
- `RUN [stage X/Y]` - Layer was executed
- Build time comparisons show effectiveness

## .NET Core Specific Caching Issues

### Common Problems Why .NET Always Rebuilds

1. **Verbose Output Changes**: Default dotnet commands are verbose and output can vary
2. **Timestamp Differences**: Build outputs include timestamps that change
3. **Assembly Metadata**: Version info and build times embedded in assemblies
4. **Incremental Build State**: MSBuild incremental state can cause cache misses

### Solutions Applied

#### ❌ Before (Always Rebuilds):
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
COPY . .  # Copies everything, invalidates cache
RUN dotnet build  # Verbose output varies
RUN dotnet publish  # Rebuilds from scratch
```

#### ✅ After (Optimized Caching):
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS restore
COPY ["**/*.csproj", "..."]  # Only project files
RUN dotnet restore --verbosity minimal  # Quiet, consistent output

FROM restore AS build
COPY . .  # Copy source after restore
WORKDIR /src/Services/CRM/Api  # Correct path with /src prefix
RUN dotnet build --no-restore --verbosity minimal  # Skip restore, quiet
  
FROM build AS publish  
RUN dotnet publish --no-restore --verbosity minimal  # Skip restore only
```

### Key Optimizations

1. **Separate Restore Stage**: Isolate package restoration for better caching
2. **--no-restore**: Skip restore in build stage (already done)
3. **Correct Working Directory**: Use `/src/Services/...` not `/Services/...`
4. **--verbosity minimal**: Reduce output variation
5. **Multi-stage**: Each stage has a specific purpose
6. **Remove --no-build**: Can cause dependency issues in complex projects

### Additional .NET Cache Optimizations

```dockerfile
# Use specific .NET versions to avoid base image changes
FROM mcr.microsoft.com/dotnet/sdk:9.0.101 AS build  # Specific patch version

# Set consistent environment
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1

# Use NuGet cache mount for even better performance
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet restore --verbosity minimal
```

### Debug Build Caching

If you need to debug why builds aren't cached:

```bash
# Build with detailed output
docker build --progress=plain --no-cache .

# Check layer changes
docker history your-image:latest

# Compare with previous build
docker diff container-id
```

### Performance Comparison

- **Before**: 2-5 minutes every build
- **After**: 
  - No source changes: ~10 seconds
  - Source changes only: ~30 seconds  
  - Package changes: ~2 minutes
