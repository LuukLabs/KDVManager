// File: KDVManager.Shared.Infrastructure/Tenancy/TenancyMiddleware.cs
using KDVManager.Shared.Contracts.Tenancy;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace KDVManager.Shared.Infrastructure.Tenancy;

public class MassTransitTenancySendFilter<T> : IFilter<SendContext<T>>
    where T : class
{
    private readonly ITenancyContextAccessor _tenancyContextAccessor;
    private readonly ILogger<MassTransitTenancySendFilter<T>> _logger;

    public MassTransitTenancySendFilter(ITenancyContextAccessor tenancyContextAccessor, ILogger<MassTransitTenancySendFilter<T>> logger)
    {
        _tenancyContextAccessor = tenancyContextAccessor;
        _logger = logger;
        _logger.LogInformation("MassTransitTenancySendFilter initialized.");
    }

    public void Probe(ProbeContext context) { }

    public async Task Send(SendContext<T> context, IPipe<SendContext<T>> next)
    {
        _logger.LogInformation("MassTransitTenancySendFilter Send method called.");

        var tenantId = _tenancyContextAccessor.Current?.TenantId;
        if (tenantId != null)
        {
            _logger.LogInformation("Setting TenantId header: {TenantId}", tenantId);
            context.Headers.Set("TenantId", tenantId.ToString());
        }

        await next.Send(context);
    }
}
