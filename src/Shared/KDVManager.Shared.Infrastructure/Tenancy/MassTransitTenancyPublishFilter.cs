using KDVManager.Shared.Contracts.Tenancy;
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
    }

    public void Probe(ProbeContext context) { }

    public async Task Send(PublishContext<T> context, IPipe<PublishContext<T>> next)
    {
        if (_tenancyContextAccessor.HasTenant)
        {
            var tenantId = _tenancyContextAccessor.Current!.TenantId;
            _logger.LogDebug("Setting {Header} header: {TenantId}", TenancyHeaders.TenantId, tenantId);
            context.Headers.Set(TenancyHeaders.TenantId, tenantId.ToString());
        }

        await next.Send(context);
    }
}
