using System;
using MediatR;

namespace KDVManager.Services.GroupManagement.Application.Features.Groups.Queries.GetGroupDetail
{
    public class GetGroupDetailQuery: IRequest<GroupDetailVM>
    {
         public Guid Id { get; set; }
    }
}
