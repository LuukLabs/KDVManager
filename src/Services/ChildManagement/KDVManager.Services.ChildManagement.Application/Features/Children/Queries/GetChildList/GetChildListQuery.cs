using System;
using System.Collections.Generic;
using KDVManager.Services.ChildManagement.Domain;
using MediatR;

namespace KDVManager.Services.ChildManagement.Application.Features.Children.Queries.GetChildList
{
    public class GetChildListQuery : IRequest<List<ChildListVM>>
    {
       
    }
}
