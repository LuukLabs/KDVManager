using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Shared.Contracts.Events;
using KDVManager.Shared.Contracts.Tenancy;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.CRM.Application.Events;

/// <summary>
/// Applies trial changes made after registration (e.g. a platform admin extending
/// the trial) to the local read model, mirroring <see cref="TenantRegisteredEventConsumer"/>.
/// The tenant id is provided via the message's TenantId header.
/// </summary>
public class TenantTrialChangedEventConsumer : IConsumer<TenantTrialChangedEvent>
{
    private readonly ILogger<TenantTrialChangedEventConsumer> _logger;
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenancyContextAccessor _tenancyContextAccessor;

    public TenantTrialChangedEventConsumer(
        ILogger<TenantTrialChangedEventConsumer> logger,
        ITenantRepository tenantRepository,
        ITenancyContextAccessor tenancyContextAccessor)
    {
        _logger = logger;
        _tenantRepository = tenantRepository;
        _tenancyContextAccessor = tenancyContextAccessor;
    }

    public async Task Consume(ConsumeContext<TenantTrialChangedEvent> context)
    {
        var tenantId = _tenancyContextAccessor.Current!.TenantId;

        _logger.LogInformation(
            "Processing TenantTrialChangedEvent for tenant {TenantId} (trial start {TrialStartDate:o})",
            tenantId,
            context.Message.TrialStartDate);

        await _tenantRepository.UpsertTrialAsync(
            tenantId,
            context.Message.TrialStartDate,
            context.Message.IsSubscribed,
            context.CancellationToken);
    }
}
