using System.Threading.Tasks;
using KDVManager.Services.Tenants.Application.Contracts.Persistence;
using KDVManager.Services.Tenants.Domain.Entities;

namespace KDVManager.Services.Tenants.Application.Features.Tenants.Queries.GetTenantDetail;

public class GetTenantDetailQueryHandler
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantDetailQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<TenantDetailVM> Handle(GetTenantDetailQuery request)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.Id);

        if (tenant == null)
        {
            throw new Exceptions.NotFoundException(nameof(Tenant), request.Id);
        }

        return new TenantDetailVM
        {
            Id = tenant.Id,
            Name = tenant.Name,
            IsActive = tenant.IsActive,
            CreatedAt = tenant.CreatedAt
        };
    }
}
