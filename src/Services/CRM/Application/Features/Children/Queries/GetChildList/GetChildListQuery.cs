using System.ComponentModel;
using System.Runtime.InteropServices;

namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList
{
    public class GetChildListQuery : PageParameters
    {
        public string? Search { get; set; }
    }
}
