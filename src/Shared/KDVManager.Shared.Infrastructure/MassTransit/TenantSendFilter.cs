using System;
using System.Threading.Tasks;
using KDVManager.Shared.Domain.Services;
using MassTransit;

namespace KDVManager.Shared.Infrastructure.MassTransit;

/// <summary>
/// Send filter that automatically adds tenant information to all sent messages
/// This completely abstracts tenant handling from the application layer
/// </summary>
public class TenantSendFilter : IFilter<SendContext>
{
    private readonly ITenantService _tenantService;

    public TenantSendFilter(ITenantService tenantService)
    {
        _tenantService = tenantService;
    }

    public void Probe(ProbeContext context)
    {
        context.CreateFilterScope("tenantSend");
    }

    public async Task Send(SendContext context, IPipe<SendContext> next)
    {
        // Always add tenant information to headers for sent messages
        try
        {
            var tenantId = _tenantService.CurrentTenant;
            if (tenantId != Guid.Empty)
            {
                context.Headers.Set("TenantId", tenantId.ToString());
            }
        }
        catch
        {
            // If we can't get tenant, continue without it (for system messages, etc.)
        }

        await next.Send(context);
    }
}
