using System;
using System.Collections.Generic;
using KDVManager.Services.Scheduling.Domain;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Queries.GetGroupList
{
    public class GetGroupsListQuery : IRequest<List<GroupListVM>>
    {

    }
}
