using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Shared.Contracts.Events;
using KDVManager.Shared.Contracts.Tenancy;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.CRM.Application.Events;

/// <summary>
/// Drops the local tenant trial read model when the TenantManagement service
/// deletes a tenant. The tenant id is provided via the message's TenantId header
/// (set on the tenancy context by the MassTransit consume filter). The tenant's
/// CRM data itself is not purged here — that is future business logic.
/// </summary>
public class TenantDeletedEventConsumer : IConsumer<TenantDeletedEvent>
{
    private readonly ILogger<TenantDeletedEventConsumer> _logger;
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenancyContextAccessor _tenancyContextAccessor;

    public TenantDeletedEventConsumer(
        ILogger<TenantDeletedEventConsumer> logger,
        ITenantRepository tenantRepository,
        ITenancyContextAccessor tenancyContextAccessor)
    {
        _logger = logger;
        _tenantRepository = tenantRepository;
        _tenancyContextAccessor = tenancyContextAccessor;
    }

    public async Task Consume(ConsumeContext<TenantDeletedEvent> context)
    {
        var tenantId = _tenancyContextAccessor.Current!.TenantId;

        _logger.LogInformation("Processing TenantDeletedEvent for tenant {TenantId}", tenantId);

        await _tenantRepository.DeleteAsync(tenantId, context.CancellationToken);
    }
}
