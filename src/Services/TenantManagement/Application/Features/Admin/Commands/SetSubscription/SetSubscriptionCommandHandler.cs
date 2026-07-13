using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.TenantManagement.Application.Common;
using KDVManager.Services.TenantManagement.Application.Contracts.Persistence;
using KDVManager.Services.TenantManagement.Domain.Enums;
using KDVManager.Shared.Contracts.Events;
using KDVManager.Shared.Contracts.Tenancy;
using MassTransit;

namespace KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.SetSubscription;

/// <summary>
/// Converts a tenant to a subscription (or back to trial). A subscribed tenant is
/// exempt from trial expiry everywhere: the change is published via
/// <see cref="TenantTrialChangedEvent"/> so the CRM/Scheduling read models — and
/// with them their local 402 enforcement — follow automatically. Reverting to
/// trial re-applies the regular expiry rules to the unchanged trial dates.
/// </summary>
public class SetSubscriptionCommandHandler
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ITenancyContextAccessor _tenancyContextAccessor;

    public SetSubscriptionCommandHandler(
        ITenantRepository tenantRepository,
        IPublishEndpoint publishEndpoint,
        ITenancyContextAccessor tenancyContextAccessor)
    {
        _tenantRepository = tenantRepository;
        _publishEndpoint = publishEndpoint;
        _tenancyContextAccessor = tenancyContextAccessor;
    }

    /// <summary>Returns the updated tenant, or null when it does not exist.</summary>
    public async Task<AdminTenantVM?> Handle(SetSubscriptionCommand command, CancellationToken cancellationToken = default)
    {
        var tenant = await _tenantRepository.GetByIdAsync(command.TenantId, cancellationToken);
        if (tenant is null)
            return null;

        tenant.SubscriptionStatus = command.Subscribed ? SubscriptionStatus.Active : SubscriptionStatus.Trial;
        await _tenantRepository.UpdateAsync(tenant, cancellationToken);

        // Publish under the *target* tenant's ambient context so the publish filter
        // stamps its TenantId header (the admin's own claim is a different tenant).
        _tenancyContextAccessor.Current = new AmbientTenantContext(tenant.Id);

        await _publishEndpoint.Publish(
            new TenantTrialChangedEvent
            {
                TrialStartDate = tenant.TrialStartDate,
                IsSubscribed = command.Subscribed,
            },
            cancellationToken);

        return AdminTenantVM.FromTenant(tenant);
    }
}
