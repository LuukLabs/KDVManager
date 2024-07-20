using KDVManager.Services.CRM.Application.Contracts.Pagination;
using MediatR;

namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList
{
    public class GetChildListQuery : PageParameters, IRequest<PagedList<ChildListVM>>
    {
        public string Search { get; set; }
    }
}
