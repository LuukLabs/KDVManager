using System.ComponentModel;
using System.Runtime.InteropServices;
using KDVManager.Shared.Application.Contracts.Pagination;

namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList
{
    public class GetChildListQuery : PageParameters
    {
        public string? Search { get; set; }
    }
}
