using System.ComponentModel;
using System.Runtime.InteropServices;
using KDVManager.Services.CRM.Application.Contracts.Pagination;

namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList
{
    public class GetChildListQuery : PageParameters
    {
        public string? Search { get; set; }

        [property: DefaultValue(false)]
        public bool? Archived { get; set; } = false;
    }
}
