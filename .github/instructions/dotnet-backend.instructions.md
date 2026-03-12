---
description: "Use when working with .NET backend services, Clean Architecture handlers, commands, queries, validators, or API endpoints."
applyTo: "src/Services/**/*.cs"
---
# .NET Backend Conventions

## Feature Folder Structure
```
Application/Features/{Entity}/Commands/{Action}/
  {Action}Command.cs
  {Action}CommandValidator.cs
  {Action}CommandHandler.cs
Application/Features/{Entity}/Queries/{Action}/
  {Action}Query.cs
  {Action}QueryHandler.cs
  {Action}VM.cs (view model)
```

## Handlers
- Plain classes, no interfaces, no MediatR
- Signature: `public async Task<T> Handle(TRequest request)`
- Injected via DI (constructor injection)
- Instantiate validator inside `Handle()`, throw `ValidationException` on failure:
```csharp
var validator = new AddChildCommandValidator();
var validationResult = await validator.ValidateAsync(request);
if (!validationResult.IsValid)
    throw new Exceptions.ValidationException(validationResult);
```

## Validators
- One per command, inheriting `AbstractValidator<TCommand>` (FluentValidation 12)
- Defined in the same feature folder as the command

## Events
- Publish via MassTransit `IPublishEndpoint` after persistence
- Event classes in `Shared/KDVManager.Shared.Contracts/Events/`

## Endpoints
- CRM: Minimal API, static extension methods (`MapChildrenEndpoints`)
- Scheduling: Traditional `[ApiController]` controllers

## Multi-tenancy
- Resolved from JWT via `JwtTenancyResolver`
- Propagated through MassTransit publish/consume filters
