using System.Diagnostics;
using KDVManager.Shared.Contracts.Tenancy;
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
        if (context.Headers.TryGetHeader(TenancyHeaders.TenantId, out var tenantIdHeader) && tenantIdHeader is string headerValue)
        {
            if (!Guid.TryParse(headerValue, out var tenantId))
            {
                // Fail closed: a malformed tenant header must never result in the
                // message being processed without (or with the wrong) tenant scope.
                throw new TenantRequiredException($"Message of type {typeof(T).Name} carries a malformed {TenancyHeaders.TenantId} header.");
            }

            _tenancyContextAccessor.Current = new StaticTenancyContext(tenantId);
            Activity.Current?.SetTag("tenant.id", tenantId.ToString());

            using (_logger.BeginScope(new Dictionary<string, object>
                   {
                       { "tenant.id", tenantId }
                   }))
            {
                await next.Send(context);
                return;
            }
        }

        _logger.LogDebug("Message of type {MessageType} has no {Header} header; consuming without tenant context.", typeof(T).Name, TenancyHeaders.TenantId);
        await next.Send(context);
    }

    public void Probe(ProbeContext context)
    { }
}
