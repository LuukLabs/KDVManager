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
        _logger.LogInformation("MassTransitTenancyConsumeFilter initialized.");
    }

    public async Task Send(ConsumeContext<T> context, IPipe<ConsumeContext<T>> next)
    {
        _logger.LogInformation("MassTransitTenancyConsumeFilter Send method called.");

        if (context.Headers.TryGetHeader("TenantId", out var tenantIdHeader) && tenantIdHeader is string tenantId)
        {
            _logger.LogInformation("Setting TenantId in TenancyContext: {TenantId}", tenantId);
            _tenancyContextAccessor.Current = new StaticTenancyContext(Guid.Parse(tenantId));
        }

        await next.Send(context);
    }

    public void Probe(ProbeContext context)
    { }
}
