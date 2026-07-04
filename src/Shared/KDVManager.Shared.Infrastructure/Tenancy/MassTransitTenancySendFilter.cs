using KDVManager.Shared.Contracts.Tenancy;
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
    }

    public void Probe(ProbeContext context) { }

    public async Task Send(SendContext<T> context, IPipe<SendContext<T>> next)
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
