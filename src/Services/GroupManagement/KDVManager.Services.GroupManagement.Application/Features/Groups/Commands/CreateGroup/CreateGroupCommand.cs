using System;
using MediatR;

namespace KDVManager.Services.GroupManagement.Application.Features.Groups.Commands.CreateGroup
{
    public class CreateGroupCommand : IRequest<Guid>
    {
        public string Name { get; set; }

    }
}
