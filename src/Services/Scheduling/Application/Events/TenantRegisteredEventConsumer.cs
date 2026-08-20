using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Shared.Contracts.Events;
using KDVManager.Shared.Contracts.Tenancy;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.Scheduling.Application.Events;

/// <summary>
/// Keeps the local tenant trial read model in sync with the TenantManagement service. The
/// tenant id is provided via the message's TenantId header (set on the tenancy
/// context by the MassTransit consume filter).
/// </summary>
public class TenantRegisteredEventConsumer : IConsumer<TenantRegisteredEvent>
{
    private readonly ILogger<TenantRegisteredEventConsumer> _logger;
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenancyContextAccessor _tenancyContextAccessor;

    public TenantRegisteredEventConsumer(
        ILogger<TenantRegisteredEventConsumer> logger,
        ITenantRepository tenantRepository,
        ITenancyContextAccessor tenancyContextAccessor)
    {
        _logger = logger;
        _tenantRepository = tenantRepository;
        _tenancyContextAccessor = tenancyContextAccessor;
    }

    public async Task Consume(ConsumeContext<TenantRegisteredEvent> context)
    {
        var tenantId = _tenancyContextAccessor.Current!.TenantId;

        _logger.LogInformation(
            "Processing TenantRegisteredEvent for tenant {TenantId} (trial start {TrialStartDate:o})",
            tenantId,
            context.Message.TrialStartDate);

        await _tenantRepository.UpsertTrialAsync(
            tenantId,
            context.Message.TrialStartDate,
            isSubscribed: false,
            context.CancellationToken);
    }
}
