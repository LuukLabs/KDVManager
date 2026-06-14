using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.TenantManagement.Application.Contracts.Persistence;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Contracts.Trial;

namespace KDVManager.Services.TenantManagement.Infrastructure.Services;

/// <summary>
/// Source-of-truth trial status for the current tenant. The tenant is created
/// explicitly during onboarding (see ProvisionTenant), so by the time a request
/// carries a tenant claim the record exists. If it is somehow missing, the trial
/// is treated as active (fail open) rather than blocking the user.
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
            return new TrialStatus { IsExpired = false, DaysRemaining = TrialStatus.TrialDurationDays };

        return TrialStatus.FromStartDate(tenant.TrialStartDate);
    }
}
