using System;
using MediatR;

namespace KDVManager.Services.GroupManagement.Application.Features.Groups.Commands.DeleteGroup
{
    public class DeleteGroupCommand : IRequest
    {
        public Guid Id { get; set; }
    }
}
