using System;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Queries.GetGroupDetail
{
    public class GetGroupDetailQuery: IRequest<GroupDetailVM>
    {
         public Guid Id { get; set; }
    }
}
