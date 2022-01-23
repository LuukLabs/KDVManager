using System;
using System.Collections.Generic;
using KDVManager.Services.ChildManagement.Domain;
using KDVManager.Services.ChildManagement.Application.Contracts.Queries;
using MediatR;

namespace KDVManager.Services.ChildManagement.Application.Features.Children.Queries.GetChildList
{
    public class GetChildListQuery : PaginationQuery, IRequest<List<ChildListVM>>
    {
    }
}
