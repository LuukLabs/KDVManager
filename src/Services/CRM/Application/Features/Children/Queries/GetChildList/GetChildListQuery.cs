using System;
using System.Collections.Generic;
using KDVManager.Services.CRM.Domain;
using KDVManager.Services.CRM.Application.Contracts.Pagination;
using MediatR;

namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList
{
    public class GetChildListQuery : PageParameters, IRequest<PagedList<ChildListVM>>
    {
    }
}
