using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Contracts.Trial;

namespace KDVManager.Services.Scheduling.Infrastructure.Services;

/// <summary>
/// Read-model trial status for the Scheduling service. The trial start date is
/// synced from the CRM service (source of truth) via <c>TenantRegisteredEvent</c>.
/// When the read model has not been populated yet (event not yet received), the
/// trial is treated as active so the service fails open rather than locking out a
/// freshly-registered tenant; the CRM service still enforces authoritatively.
/// </summary>
public class TrialStatusService : ITrialStatusService
{
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenancyContextAccessor _tenancyContextAccessor;

    public TrialStatusService(
        ITenantRepository tenantRepository,
        ITenancyContextAccessor tenancyContextAccessor)
    {
        _tenantRepository = tenantRepository;
        _tenancyContextAccessor = tenancyContextAccessor;
    }

    public async Task<TrialStatus> GetTrialStatusAsync(CancellationToken cancellationToken = default)
    {
        var tenantId = _tenancyContextAccessor.Current!.TenantId;
        var tenant = await _tenantRepository.GetByIdAsync(tenantId, cancellationToken);

        if (tenant is null)
        {
            // Not yet synced: fail open (CRM enforces authoritatively).
            return new TrialStatus { IsExpired = false, DaysRemaining = TrialStatus.TrialDurationDays };
        }

        return TrialStatus.FromStartDate(tenant.TrialStartDate);
    }
}
