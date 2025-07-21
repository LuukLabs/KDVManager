// File: KDVManager.Shared.Infrastructure/Tenancy/TenancyMiddleware.cs
using KDVManager.Shared.Contracts.Tenancy;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace KDVManager.Shared.Infrastructure.Tenancy;

public class MassTransitTenancyPublishFilter<T> : IFilter<PublishContext<T>>
    where T : class
{
    private readonly ITenancyContextAccessor _tenancyContextAccessor;
    private readonly ILogger<MassTransitTenancyPublishFilter<T>> _logger;

    public MassTransitTenancyPublishFilter(ITenancyContextAccessor tenancyContextAccessor, ILogger<MassTransitTenancyPublishFilter<T>> logger)
    {
        _tenancyContextAccessor = tenancyContextAccessor;
        _logger = logger;
        _logger.LogInformation("MassTransitTenancyPublishFilter initialized.");
    }

    public void Probe(ProbeContext context) { }

    public async Task Send(PublishContext<T> context, IPipe<PublishContext<T>> next)
    {
        _logger.LogInformation("MassTransitTenancyPublishFilter Send method called.");

        var tenantId = _tenancyContextAccessor.Current?.TenantId;
        if (tenantId != null)
        {
            _logger.LogInformation("Setting TenantId header: {TenantId}", tenantId);
            context.Headers.Set("TenantId", tenantId.ToString());
        }

        await next.Send(context);
    }
}
