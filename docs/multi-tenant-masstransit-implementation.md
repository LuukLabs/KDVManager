# Multi-Tenant MassTransit with RabbitMQ Implementation

This document describes the DRY (Don't Repeat Yourself) implementation of multi-tenancy for MassTransit with RabbitMQ in the KDVManager system.

## Architecture Overview

The implementation follows best practices by providing a shared, reusable infrastructure for tenant resolution across all microservices. The solution consists of:

### 1. Shared Infrastructure Components

#### `ITenantService` Interface
```csharp
public interface ITenantService
{
    Guid Tenant { get; }
}
```

- **Unified Interface**: Works for both HTTP requests (from JWT claims) and MassTransit consumers (from message context)
- **Cross-Context**: Automatically resolves tenant from the appropriate context
- Located in: `KDVManager.Services.Shared.Contracts`

#### `TenantService` Implementation
```csharp
public class TenantService : ITenantService
{
    public Guid Tenant
    {
        get
        {
            // First, try to get tenant from MassTransit context (for consumers)
            if (_tenantContext.TenantId.HasValue && _tenantContext.TenantId.Value != Guid.Empty)
            {
                return _tenantContext.TenantId.Value;
            }

            // Fallback to HTTP context (for API controllers)
            if (_httpContextAccessor.HttpContext != null && 
                TryGetTenantFromClaims(_httpContextAccessor.HttpContext.User.Claims, out var tenant))
            {
                return tenant;
            }

            throw new TenantRequiredException("No tenant found in current context (HTTP or MassTransit)");
        }
    }
}
```

- **Context-Aware**: Automatically switches between MassTransit and HTTP contexts
- **Fallback Strategy**: Tries MassTransit context first, then HTTP context
- **JWT Claims Support**: Extracts tenant from "https://kdvmanager.nl/tenant" claim
- Located in: `KDVManager.Services.Shared.Services`

#### `ITenantContext` Interface
```csharp
public interface ITenantContext
{
    Guid? TenantId { get; }
    void SetTenantId(Guid tenantId);
    Guid GetRequiredTenantId();
}
```

- Provides access to the current tenant in message consumers
- Thread-safe and scoped per consumer execution
- Located in: `KDVManager.Services.Shared.Contracts`

#### `TenantContext` Implementation
```csharp
public class TenantContext : ITenantContext
```

- Concrete implementation of tenant context
- Registered as scoped service in DI container
- Located in: `KDVManager.Services.Shared.Services`

#### `TenantResolutionMiddleware<T>`
```csharp
public class TenantResolutionMiddleware<T> : IFilter<ConsumeContext<T>>
```

- MassTransit middleware that extracts tenant information from messages
- Supports two sources: message properties (primary) and message headers (fallback)
- Automatically detects `TenantId` property using reflection
- Sets the tenant context for downstream consumers
- Located in: `KDVManager.Services.Shared.Middleware`

#### `TenantAwareConsumerBase<TMessage>`
```csharp
public abstract class TenantAwareConsumerBase<TMessage> : IConsumer<TMessage>
```

- Base class for all tenant-aware consumers
- Provides automatic tenant resolution and validation
- Includes built-in error handling and logging
- Forces implementation of `ConsumeMessage` method
- Located in: `KDVManager.Services.Shared.Consumers`

### 2. Configuration Extensions

#### `TenantMassTransitExtensions`
```csharp
public static class TenantMassTransitExtensions
{
    public static IServiceCollection AddTenantServices(this IServiceCollection services)
    public static void UseTenantResolution(this IBusFactoryConfigurator configurator, IRegistrationContext context)
    public static void UseTenantResolution(this IReceiveEndpointConfigurator configurator, IRegistrationContext context)
}
```

- Extension methods for easy configuration
- Registers both `ITenantContext` and `ITenantService` in DI container
- Applies middleware to MassTransit configurations
- Located in: `KDVManager.Services.Shared.Extensions`

## Implementation Benefits

### 1. DRY Principle
- **Single Implementation**: All tenant logic is implemented once in the shared library
- **Reusable Components**: Any microservice can use the same tenant infrastructure
- **Consistent Behavior**: All services handle tenancy in the same way
- **Unified Service**: One `ITenantService` works for both HTTP and MassTransit contexts

### 2. Best Practices
- **Separation of Concerns**: Tenant resolution is separate from business logic
- **Dependency Injection**: Proper DI patterns with scoped services
- **Error Handling**: Comprehensive error handling and logging
- **Type Safety**: Strong typing with generic base classes
- **Context Awareness**: Automatic detection of execution context

### 3. Maintainability
- **Centralized Updates**: Changes to tenant logic only need to be made in one place
- **Easy Testing**: Clear separation allows for easier unit testing
- **Clear Interfaces**: Well-defined contracts between components
- **Cross-Service Compatibility**: Same tenant service works across all microservices

## Usage Example

### 1. Service Configuration
```csharp
public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
{
    // ... other services

    // Add tenant services from shared infrastructure
    // This registers both ITenantContext and ITenantService
    services.AddTenantServices();

    return services;
}

public static IServiceCollection AddMassTransitServices(this IServiceCollection services, IConfiguration configuration)
{
    services.AddMassTransit(x =>
    {
        x.AddConsumer<ChildAddedEventConsumer>();

        x.UsingRabbitMq((context, cfg) =>
        {
            cfg.Host(configuration.GetConnectionString("RabbitMQ"));

            // Apply tenant resolution middleware globally
            cfg.UseTenantResolution(context);

            cfg.ReceiveEndpoint("scheduling-child-events", e =>
            {
                e.ConfigureConsumer<ChildAddedEventConsumer>(context);
            });
        });
    });

    return services;
}
```

### 2. Consumer Implementation
```csharp
public class ChildAddedEventConsumer : TenantAwareConsumerBase<ChildAddedEvent>
{
    private readonly AddChildCommandHandler _addChildCommandHandler;

    public ChildAddedEventConsumer(
        ILogger<ChildAddedEventConsumer> logger, 
        ITenantContext tenantContext,
        AddChildCommandHandler addChildCommandHandler) 
        : base(logger, tenantContext)
    {
        _addChildCommandHandler = addChildCommandHandler;
    }

    protected override async Task ConsumeMessage(ConsumeContext<ChildAddedEvent> context)
    {
        var childEvent = context.Message;
        var tenantId = GetCurrentTenantId(); // From base class

        // Validate tenant consistency
        if (childEvent.TenantId != tenantId)
        {
            throw new InvalidOperationException($"Tenant ID mismatch in ChildAddedEvent");
        }

        // Business logic here
        var command = new AddChildCommand
        {
            Id = childEvent.ChildId,
            BirthDate = childEvent.DateOfBirth
        };

        await _addChildCommandHandler.Handle(command);
    }
}
```

### 3. API Controller Usage
```csharp
[ApiController]
public class ChildrenController : ControllerBase
{
    private readonly ITenantService _tenantService;

    public ChildrenController(ITenantService tenantService)
    {
        _tenantService = tenantService;
    }

    [HttpGet]
    public async Task<IActionResult> GetChildren()
    {
        var tenantId = _tenantService.Tenant; // Automatically resolves from JWT claims
        
        // Use tenantId for business logic
        return Ok();
    }
}
```

## Tenant Resolution Strategy

The unified `TenantService` follows this resolution strategy:

1. **Primary Source (MassTransit)**: Check if `ITenantContext` has a tenant ID set by middleware
2. **Fallback Source (HTTP)**: Extract tenant from JWT claims in HTTP context
3. **Validation**: Ensure tenant ID is valid (not null or empty)
4. **Exception**: Throw `TenantRequiredException` if no tenant found

The middleware itself resolves tenants for MassTransit consumers:

1. **Primary Source**: Check if the message has a `TenantId` property
2. **Fallback Source**: Check message headers for "TenantId"
3. **Context Setting**: Set the tenant context for the consumer

## Message Format

Events should include tenant information:

```csharp
public class ChildAddedEvent
{
    public Guid ChildId { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public Guid TenantId { get; set; } // Required for tenant resolution
}
```

## Error Handling

The implementation includes comprehensive error handling:

- **Tenant Required Exception**: Thrown when tenant is required but not found
- **Tenant Mismatch Validation**: Validates consistency between message and context
- **Logging**: Detailed logging for debugging and monitoring
- **Graceful Degradation**: Clear error messages for troubleshooting

## Project References

To use the shared tenant infrastructure in a microservice:

1. Add project reference to `KDVManager.Services.Shared`
2. Call `services.AddTenantServices()` in service configuration (replaces individual tenant service registrations)
3. Use `cfg.UseTenantResolution(context)` in MassTransit configuration
4. Inherit from `TenantAwareConsumerBase<T>` for consumers
5. Inject `ITenantService` in controllers and services for unified tenant access

## Migration from Individual Services

When migrating from individual tenant services:

1. **Remove Old Services**: Delete `ITenantService` implementations from individual projects
2. **Add Shared Reference**: Add reference to `KDVManager.Services.Shared`
3. **Update Registration**: Replace `services.AddScoped<ITenantService, TenantService>()` with `services.AddTenantServices()`
4. **Update Usings**: Change namespace references to `KDVManager.Services.Shared.Contracts`
5. **Test**: Ensure both HTTP and MassTransit contexts work correctly

This implementation ensures consistent, maintainable, and DRY multi-tenant support across all microservices in the KDVManager system, with seamless operation in both HTTP API and MassTransit consumer contexts.
