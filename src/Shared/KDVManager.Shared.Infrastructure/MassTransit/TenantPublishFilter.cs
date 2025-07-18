using System;
using System.Threading.Tasks;
using KDVManager.Shared.Domain.Services;
using MassTransit;

namespace KDVManager.Shared.Infrastructure.MassTransit;

/// <summary>
/// Publish filter that automatically adds tenant information to all published messages
/// This completely abstracts tenant handling from the application layer
/// </summary>
public class TenantPublishFilter : IFilter<PublishContext>
{
    private readonly ITenantService _tenantService;

    public TenantPublishFilter(ITenantService tenantService)
    {
        _tenantService = tenantService;
    }

    public void Probe(ProbeContext context)
    {
        context.CreateFilterScope("tenantPublish");
    }

    public async Task Send(PublishContext context, IPipe<PublishContext> next)
    {
        // Always add tenant information to headers for published messages
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
