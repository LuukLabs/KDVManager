---
description: "Scaffold a new CRUD feature end-to-end: backend command/query handlers + validators + endpoints + frontend page + routing"
agent: "agent"
argument-hint: "Entity name and service (e.g., 'Absence in Scheduling')"
---
Create a full CRUD feature for the specified entity. Follow these steps:

## Backend
1. Create feature folders under `Application/Features/{Entity}/`:
   - `Commands/Add{Entity}/` — Command, Validator, Handler
   - `Commands/Update{Entity}/` — Command, Validator, Handler
   - `Commands/Delete{Entity}/` — Command, Handler
   - `Queries/Get{Entity}List/` — Query, Handler, VM
   - `Queries/Get{Entity}Detail/` — Query, Handler, VM
2. Create repository interface in `Application/Contracts/Persistence/`
3. Implement repository in `Infrastructure/Repositories/`
4. Add EF Core entity configuration
5. Create API endpoints (Minimal API for CRM, Controller for Scheduling)
6. Register all handlers and repositories in DI
7. Publish domain events via MassTransit for state changes

## Frontend
8. Add Orval codegen (update OpenAPI spec, regenerate)
9. Create list page at `src/web/src/pages/{entities}/Index{Entity}Page.tsx`
10. Create detail/edit page
11. Create new/add page with react-hook-form
12. Wire routes in RouterProvider with lazy loading and breadcrumbs
13. Add i18n keys (en + nl)
