using System;
using System.Threading.Tasks;
using KDVManager.Shared.Domain.Tenancy;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace KDVManager.Shared.Infrastructure.MassTransit;

/// <summary>
/// Middleware to extract tenant information from MassTransit message headers and set the tenant context
/// Tenant information is now exclusively passed via headers, not in message body
/// </summary>
public class TenantResolutionMiddleware<T> : IFilter<ConsumeContext<T>>
    where T : class
{
    private readonly ILogger<TenantResolutionMiddleware<T>> _logger;

    public TenantResolutionMiddleware(ILogger<TenantResolutionMiddleware<T>> logger)
    {
        _logger = logger;
    }

    public void Probe(ProbeContext context)
    {
        context.CreateFilterScope("tenantResolution");
    }

    public async Task Send(ConsumeContext<T> context, IPipe<ConsumeContext<T>> next)
    {
        var tenantContext = context.GetPayload<IServiceProvider>().GetRequiredService<ITenantContext>();

        // Extract tenant from message headers
        Guid? tenantId = null;

        if (context.Headers.TryGetHeader("TenantId", out var headerValue))
        {
            if (Guid.TryParse(headerValue?.ToString(), out var parsedTenantId))
            {
                tenantId = parsedTenantId;
                _logger.LogDebug("Extracted tenant ID {TenantId} from message headers for message type {MessageType}",
                    tenantId, typeof(T).Name);
            }
            else
            {
                _logger.LogWarning("Invalid tenant ID format in headers for message type {MessageType}: {HeaderValue}",
                    typeof(T).Name, headerValue);
            }
        }

        if (tenantId.HasValue && tenantId.Value != Guid.Empty)
        {
            tenantContext.SetTenant(tenantId.Value);
            _logger.LogInformation("Set tenant context for tenant {TenantId} when processing {MessageType}",
                tenantId, typeof(T).Name);
        }
        else
        {
            _logger.LogWarning("No valid tenant ID found in message headers for {MessageType}. This might cause issues with tenant-aware operations.",
                typeof(T).Name);
        }

        try
        {
            await next.Send(context);
        }
        finally
        {
            // Clear tenant context after processing to avoid leakage
            tenantContext.ClearTenant();
        }
    }
}
