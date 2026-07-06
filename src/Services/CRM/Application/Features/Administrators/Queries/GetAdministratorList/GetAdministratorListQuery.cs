using KDVManager.Services.CRM.Application.Contracts.Pagination;

namespace KDVManager.Services.CRM.Application.Features.Administrators.Queries.GetAdministratorList
{
    public class GetAdministratorListQuery : PageParameters
    {
        public string? Search { get; set; }
    }
}
