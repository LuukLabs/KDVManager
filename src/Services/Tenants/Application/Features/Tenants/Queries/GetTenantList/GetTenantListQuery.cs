using KDVManager.Services.Tenants.Application.Contracts.Pagination;

namespace KDVManager.Services.Tenants.Application.Features.Tenants.Queries.GetTenantList
{
    public class GetTenantListQuery : PageParameters
    {
        public string? Search { get; set; }
    }
}
