using System;
using System.Collections.Generic;
using KDVManager.Services.ChildManagement.Domain;
using KDVManager.Services.ChildManagement.Application.Contracts.Pagination;
using MediatR;

namespace KDVManager.Services.ChildManagement.Application.Features.Children.Queries.GetChildList
{
    public class GetChildListQuery : PageParameters, IRequest<PagedList<ChildListVM>>
    {
    }
}
