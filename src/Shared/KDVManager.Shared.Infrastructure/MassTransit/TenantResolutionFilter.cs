using System;
using System.Threading.Tasks;
using KDVManager.Shared.Domain.Tenancy;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;

namespace KDVManager.Shared.Infrastructure.MassTransit;

/// <summary>
/// Consume filter that extracts tenant information from message headers and sets the tenant context
/// This replaces the need for TenantResolutionMiddleware
/// </summary>
public class TenantResolutionFilter<T> : IFilter<ConsumeContext<T>>
    where T : class
{
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
            }
        }

        if (tenantId.HasValue && tenantId.Value != Guid.Empty)
        {
            tenantContext.SetTenant(tenantId.Value);
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
