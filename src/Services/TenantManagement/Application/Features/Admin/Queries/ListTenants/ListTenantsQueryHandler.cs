using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.TenantManagement.Application.Contracts.Persistence;
using KDVManager.Shared.Contracts.Trial;

namespace KDVManager.Services.TenantManagement.Application.Features.Admin.Queries.ListTenants;

public class ListTenantsQueryHandler
{
    private readonly ITenantRepository _tenantRepository;

    public ListTenantsQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    /// <summary>All tenants with their derived trial state, newest first.</summary>
    public async Task<IReadOnlyList<AdminTenantVM>> Handle(ListTenantsQuery query, CancellationToken cancellationToken = default)
    {
        var tenants = await _tenantRepository.ListAllAsync(cancellationToken);

        var result = new List<AdminTenantVM>(tenants.Count);
        foreach (var tenant in tenants)
        {
            var trial = TrialStatus.FromStartDate(tenant.TrialStartDate);
            result.Add(new AdminTenantVM
            {
                Id = tenant.Id,
                Name = tenant.Name,
                CreatedAt = tenant.CreatedAt,
                TrialStartDate = trial.TrialStartDate,
                TrialEndDate = trial.TrialEndDate,
                DaysRemaining = trial.DaysRemaining,
                IsExpired = trial.IsExpired,
            });
        }

        return result;
    }
}
