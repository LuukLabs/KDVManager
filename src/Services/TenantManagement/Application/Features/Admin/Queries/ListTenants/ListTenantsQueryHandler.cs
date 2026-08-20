using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.TenantManagement.Application.Contracts.Persistence;

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
        return tenants.Select(AdminTenantVM.FromTenant).ToList();
    }
}
