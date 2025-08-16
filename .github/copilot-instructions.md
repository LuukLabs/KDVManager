# KDVManager - Coding Agent Instructions

## Repository Overview

**KDVManager** is a microservices-based child daycare management system with separate CRM and Scheduling APIs, a React frontend, and comprehensive observability. The system is containerized and deployed to Kubernetes using ArgoCD.

**Architecture**: Microservices with Clean Architecture (.NET 9) + React SPA frontend  
**Deployment**: Docker containers orchestrated by Kubernetes with ArgoCD for GitOps  
**Languages**: C# (.NET 9), TypeScript/React, YAML (Kubernetes manifests)  
**Size**: ~15 services across API gateways, backend services, frontend, and infrastructure

## Key Technologies

- **Backend**: .NET 9, ASP.NET Core, Entity Framework Core, FluentValidation
- **Frontend**: React 19, TypeScript, Vite, Material UI (MUI), React Query, i18next
- **Infrastructure**: Docker, Kubernetes, Envoy Gateway, PostgreSQL, RabbitMQ
- **Observability**: SigNoz (official Helm chart), OpenTelemetry
- **Build Tools**: pnpm 10.x, Node.js 24.x, .NET SDK 9.x, Docker Compose

## Project Structure

```
├── src/
│   ├── Services/                 # Microservices (Clean Architecture)
│   │   ├── CRM/                 # Customer relationship management API
│   │   │   ├── Api/             # Web API layer
│   │   │   ├── Application/     # Use cases, commands, queries
│   │   │   ├── Domain/          # Domain entities and business logic
│   │   │   └── Infrastructure/  # Data access, external services
│   │   ├── Scheduling/          # Child scheduling API (same structure)
│   │   ├── DataMigration/       # Data migration utilities
│   │   └── ApiGateways/Envoy/   # API gateway configuration
│   ├── Shared/                  # Shared libraries across services
│   ├── web/                     # React frontend (Vite + TypeScript)
│   └── docker-compose.yml       # Local development stack
├── deploy/k8s/                  # Kubernetes manifests and ArgoCD apps
└── docs/                        # Documentation
```

## Build & Development Commands

### Frontend (src/web/)

**ALWAYS run commands from `src/web/` directory for frontend work.**

**Prerequisites**: Node.js 24.x, pnpm 10.x  
**Install dependencies**: `pnpm install --frozen-lockfile` (always use frozen lockfile)

**Development**:
- `pnpm start` - Starts dev server on http://localhost:3000
- `pnpm build` - Production build (outputs to `dist/`)
- `pnpm preview` - Preview production build locally

**Code Quality** (runs automatically in CI):
- `pnpm eslint` - Lint TypeScript/React code  
- `pnpm tsc -b` - TypeScript type checking (must pass for CI)
- `pnpm lint:fix` - Auto-fix linting issues

**API Generation**:
- `pnpm api:merge` - Merge OpenAPI specs from backend services
- `pnpm api:generate` - Generate TypeScript API clients using Orval
- `pnpm reset` - Full API regeneration + formatting (when backend APIs change)

### Backend (.NET Services)

**Prerequisites**: .NET SDK 9.x  
**Root directory commands**:

- `dotnet build KDVManager.sln` - Build entire solution
- `dotnet run --project src/Services/{Service}/Api` - Run specific service
- Individual services use standard .NET project structure

### Docker & Local Stack

**From `src/` directory**:
- `docker compose build {service}` - Build specific service container
- `docker compose up -d` - Start full local development stack
- Set `NUGET_GITHUB_TOKEN` environment variable if building .NET services

**Available services**: web, crm-api, crm-migrator, scheduling-api, scheduling-migrator, data-migration

## CI/CD & Validation

### GitHub Actions Workflows

**Triggers**: Push to main, PRs to main, workflow_dispatch  
**Path-based triggering**: Only affected services build on changes

**Web** (`.github/workflows/web.yml`):
1. pnpm install --frozen-lockfile
2. pnpm eslint (MUST pass)
3. pnpm tsc -b (MUST pass)
4. Docker build (PR) or build+push (main)

**Backend Services** (crm-api.yml, scheduling-api.yml, etc.):
1. Docker build (PR) or build+push (main)
2. Uses composite actions in `.github/workflows/composite/`

### Current Issues to be Aware Of

**Frontend TypeScript errors** (as of last check):
- Unused imports in Guardian components (`React` imports)  
- Controller render prop returning null instead of React element
- Multiple unused variables prefixed with `_` (intentional per TypeScript convention)

**Backend warnings** (non-breaking):
- Nullable reference warnings in Scheduling domain entities
- Consider adding `required` modifiers to non-nullable properties

## Key Configuration Files

### Frontend Configuration
- `package.json` - Dependencies, scripts, Node/pnpm versions
- `vite.config.mts` - Vite bundler config with React and emotion
- `eslint.config.ts` - Comprehensive ESLint rules including i18next
- `tsconfig.json` - TypeScript configuration
- `orval.config.ts` - API client generation from OpenAPI specs

### Backend Configuration  
- `KDVManager.sln` - Visual Studio solution file
- Each service: `Api/Api.csproj`, `Application/Application.csproj`, etc.
- `docker-compose.yml` - Local development orchestration

### Deployment
- `deploy/k8s/` - ArgoCD applications and Kubernetes manifests
- Services deployed as separate ArgoCD applications
- SigNoz observability deployed via official Helm chart

## Development Workflow Best Practices

### Making Changes

1. **Frontend changes**: 
   - Work in `src/web/`
   - Always run `pnpm install --frozen-lockfile` first
   - Fix ESLint errors before committing (`pnpm eslint`)
   - Ensure TypeScript compiles (`pnpm tsc -b`)

2. **Backend changes**:
   - Use Clean Architecture patterns (Domain → Application → Infrastructure → Api)
   - Follow existing MediatR command/query patterns
   - Build solution to verify (`dotnet build KDVManager.sln`)

3. **API changes**:
   - Update OpenAPI specs if changing contracts
   - Regenerate frontend clients (`pnpm reset` in web/)

### Common Issues & Solutions

**Frontend build failures**: 
- ESLint errors are blocking - fix unused variables, missing translations
- TypeScript strict checking - ensure proper typing, especially with React components

**Docker build issues**:
- Set `NUGET_GITHUB_TOKEN` environment variable for .NET services
- Build from correct working directory (`src/` for compose commands)

**Missing dependencies**: 
- Frontend: use `pnpm install --frozen-lockfile` 
- Backend: ensure .NET 9 SDK installed

## Observability & Debugging

**SigNoz**: Comprehensive APM platform deployed via official Helm chart  
**URLs**: https://signoz.kdvmanager.nl
**OTEL**: All services instrumented with OpenTelemetry for distributed tracing

## Trust These Instructions

These instructions are current and validated. Only search the codebase if:
- Instructions appear incomplete for your specific task
- You encounter errors not covered here  
- You need specific implementation details not documented

Focus on the documented commands and patterns - they work reliably when executed from the correct directories with proper prerequisites.
