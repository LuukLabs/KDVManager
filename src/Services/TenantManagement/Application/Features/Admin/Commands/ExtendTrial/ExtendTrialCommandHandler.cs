using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.TenantManagement.Application.Common;
using KDVManager.Services.TenantManagement.Application.Contracts.Persistence;
using KDVManager.Shared.Contracts.Events;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Contracts.Trial;
using MassTransit;

namespace KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.ExtendTrial;

/// <summary>
/// Extends a tenant's trial by moving its (single source of truth) TrialStartDate
/// forward so the derived trial end lands <see cref="ExtendTrialCommand.Days"/> days
/// after the current end — or after now when already expired. Publishes
/// <see cref="TenantTrialChangedEvent"/> so the CRM/Scheduling read models sync and
/// their local 402 enforcement lifts without manual intervention.
/// </summary>
public class ExtendTrialCommandHandler
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ITenancyContextAccessor _tenancyContextAccessor;

    public ExtendTrialCommandHandler(
        ITenantRepository tenantRepository,
        IPublishEndpoint publishEndpoint,
        ITenancyContextAccessor tenancyContextAccessor)
    {
        _tenantRepository = tenantRepository;
        _publishEndpoint = publishEndpoint;
        _tenancyContextAccessor = tenancyContextAccessor;
    }

    /// <summary>Returns the updated tenant, or null when it does not exist.</summary>
    public async Task<AdminTenantVM?> Handle(ExtendTrialCommand command, CancellationToken cancellationToken = default)
    {
        var tenant = await _tenantRepository.GetByIdAsync(command.TenantId, cancellationToken);
        if (tenant is null)
            return null;

        var now = DateTime.UtcNow;
        var currentEnd = TrialStatus.FromStartDate(tenant.TrialStartDate, now).TrialEndDate;
        var newEnd = (currentEnd > now ? currentEnd : now).AddDays(command.Days);

        // The trial end is always TrialStartDate + TrialDurationDays, so extending
        // means moving the start date forward to produce the desired end.
        tenant.TrialStartDate = newEnd.AddDays(-TrialStatus.TrialDurationDays);
        await _tenantRepository.UpdateAsync(tenant, cancellationToken);

        // Publish under the *target* tenant's ambient context so the publish filter
        // stamps its TenantId header (the admin's own claim is a different tenant).
        _tenancyContextAccessor.Current = new AmbientTenantContext(tenant.Id);

        await _publishEndpoint.Publish(
            new TenantTrialChangedEvent
            {
                TrialStartDate = tenant.TrialStartDate,
                IsSubscribed = tenant.SubscriptionStatus == Domain.Enums.SubscriptionStatus.Active,
            },
            cancellationToken);

        return AdminTenantVM.FromTenant(tenant);
    }
}
