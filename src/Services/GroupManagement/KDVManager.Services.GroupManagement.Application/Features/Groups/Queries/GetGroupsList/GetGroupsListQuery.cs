using System;
using System.Collections.Generic;
using KDVManager.Services.GroupManagement.Domain;
using MediatR;

namespace KDVManager.Services.GroupManagement.Application.Features.Groups.Queries.GetGroupList
{
    public class GetGroupsListQuery : IRequest<List<GroupListVM>>
    {
       
    }
}
