# Layered Shared Architecture for KDVManager

## Overview

The shared infrastructure has been refactored from a single project into a proper layered architecture following Clean Architecture principles.

## New Structure

```
src/Shared/
├── KDVManager.Shared.Domain/          # Core domain concepts
│   ├── Tenancy/
│   │   ├── ITenantContext.cs          # Domain tenant context interface
│   │   └── TenantRequiredException.cs # Domain exception
│   └── Services/
│       └── ITenantService.cs          # Domain service interface
├── KDVManager.Shared.Contracts/       # Events and DTOs
│   ├── Events/
│   │   ├── ChildAddedEvent.cs         # Shared event definitions
│   │   └── ChildUpdatedEvent.cs
│   └── Tenancy/
│       └── ITenantAware.cs            # Contract for tenant-aware objects
├── KDVManager.Shared.Application/     # Application layer concerns
│   └── MassTransit/
│       └── TenantAwareConsumerBase.cs # Base class for consumers
└── KDVManager.Shared.Infrastructure/  # Infrastructure implementations
    ├── Tenancy/
    │   ├── TenantContext.cs           # Concrete tenant context
    │   └── TenantService.cs           # Unified tenant service
    ├── MassTransit/
    │   └── TenantResolutionMiddleware.cs # MassTransit middleware
    └── Extensions/
        └── TenantMassTransitExtensions.cs # DI configuration
```

## Benefits of Layered Approach

### 1. **Clean Architecture Compliance**
- **Domain**: Pure business logic, no external dependencies
- **Contracts**: Shared DTOs and interfaces, no framework dependencies
- **Application**: Application logic with framework abstractions
- **Infrastructure**: Concrete implementations with full framework access

### 2. **Proper Dependency Flow**
```
Infrastructure → Application → Domain
Infrastructure → Contracts
Application → Contracts
```

### 3. **Separation of Concerns**
- **Domain Layer**: Business rules and entities
- **Contracts Layer**: Data transfer objects and events
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: External concerns (HTTP, MassTransit, etc.)

### 4. **Better Testability**
- Domain layer can be tested in isolation
- Application layer can be tested with mocked infrastructure
- Clear boundaries make unit testing easier

### 5. **Flexible Dependency Management**
- Services only reference the layers they need
- Domain services don't pull in MassTransit or ASP.NET Core
- API projects don't need to reference MassTransit if they only need tenant services

## Migration Benefits

### Before (Single Shared Project)
```csharp
// Problem: Mixed concerns in one project
KDVManager.Services.Shared
├── ITenantContext.cs           // Domain concern
├── TenantService.cs            // Infrastructure concern
├── TenantAwareConsumerBase.cs  // Application concern
├── Events/                     // Contract concern
└── Middleware/                 // Infrastructure concern
```

### After (Layered Shared Projects)
```csharp
// Solution: Clear separation of concerns
Domain:         Pure business logic
Contracts:      Shared interfaces and events
Application:    Application services and abstractions
Infrastructure: Concrete implementations
```

## Usage Examples

### Domain Layer Usage (Business Logic)
```csharp
// Reference: KDVManager.Shared.Domain
using KDVManager.Shared.Domain.Services;

public class SomeBusinessService
{
    private readonly ITenantService _tenantService;
    
    public SomeBusinessService(ITenantService tenantService)
    {
        _tenantService = tenantService;
    }
    
    public void DoBusinessLogic()
    {
        var tenantId = _tenantService.Tenant;
        // Business logic here
    }
}
```

### Application Layer Usage (MassTransit Consumers)
```csharp
// Reference: KDVManager.Shared.Application + KDVManager.Shared.Contracts
using KDVManager.Shared.Application.MassTransit;
using KDVManager.Shared.Contracts.Events;

public class MyConsumer : TenantAwareConsumerBase<ChildAddedEvent>
{
    public MyConsumer(ILogger logger, ITenantService tenantService) 
        : base(logger, tenantService) { }
        
    protected override async Task ConsumeMessage(ConsumeContext<ChildAddedEvent> context)
    {
        // Tenant validation is automatic
        // Business logic here
    }
}
```

### Infrastructure Layer Usage (Configuration)
```csharp
// Reference: KDVManager.Shared.Infrastructure
using KDVManager.Shared.Infrastructure.Extensions;

public static IServiceCollection AddInfrastructureServices(
    this IServiceCollection services, IConfiguration configuration)
{
    // Registers all tenant services
    services.AddTenantServices();
    return services;
}
```

## Next Steps

1. **Complete Migration**: Update all service references to use the new layered structure
2. **Update Project References**: Point to specific shared projects as needed
3. **Clean Up**: Remove old monolithic shared project
4. **Testing**: Verify all services work with the new structure
5. **Documentation**: Update all service documentation

This layered approach provides better maintainability, testability, and follows Clean Architecture principles while maintaining the DRY benefits of shared infrastructure.
