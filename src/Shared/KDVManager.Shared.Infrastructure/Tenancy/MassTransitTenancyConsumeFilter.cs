// File: KDVManager.Shared.Infrastructure/Tenancy/TenancyMiddleware.cs
using KDVManager.Shared.Contracts.Tenancy;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace KDVManager.Shared.Infrastructure.Tenancy;

public class MassTransitTenancyConsumeFilter<T> : IFilter<ConsumeContext<T>>
    where T : class
{
    private readonly ITenancyContextAccessor _tenancyContextAccessor;
    private readonly ILogger<MassTransitTenancyConsumeFilter<T>> _logger;

    public MassTransitTenancyConsumeFilter(ITenancyContextAccessor tenancyContextAccessor, ILogger<MassTransitTenancyConsumeFilter<T>> logger)
    {
        _tenancyContextAccessor = tenancyContextAccessor;
        _logger = logger;
    }

    public async Task Send(ConsumeContext<T> context, IPipe<ConsumeContext<T>> next)
    {
        if (context.Headers.TryGetHeader("TenantId", out var tenantIdHeader) && tenantIdHeader is string tenantId)
        {
            if (Guid.TryParse(tenantId, out var tenantGuid))
            {
                _logger.LogDebug("Setting TenantId in TenancyContext: {TenantId}", tenantGuid);
                _tenancyContextAccessor.Current = new StaticTenancyContext(tenantGuid);
            }
            else
            {
                // Malformed tenant header: do not set a tenant. Downstream data access
                // then fails closed via TenantRequiredException rather than throwing here.
                _logger.LogWarning("Received message with malformed TenantId header: {TenantId}", tenantId);
            }
        }

        await next.Send(context);
    }

    public void Probe(ProbeContext context)
    { }
}
