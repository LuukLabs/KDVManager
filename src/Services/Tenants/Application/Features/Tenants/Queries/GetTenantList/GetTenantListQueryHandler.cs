using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Tenants.Application.Contracts.Persistence;
using KDVManager.Services.Tenants.Application.Contracts.Pagination;

namespace KDVManager.Services.Tenants.Application.Features.Tenants.Queries.GetTenantList;

public class GetTenantListQueryHandler
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantListQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<PagedList<TenantListVM>> Handle(GetTenantListQuery request)
    {
        var tenants = await _tenantRepository.PagedAsync(request, request.Search);
        var count = await _tenantRepository.CountAsync(request.Search);

        List<TenantListVM> tenantListVMs = tenants.Select(tenant => new TenantListVM
        {
            Id = tenant.Id,
            Name = tenant.Name,
            IsActive = tenant.IsActive,
            CreatedAt = tenant.CreatedAt
        }).ToList();

        return new PagedList<TenantListVM>(tenantListVMs, count);
    }
}
