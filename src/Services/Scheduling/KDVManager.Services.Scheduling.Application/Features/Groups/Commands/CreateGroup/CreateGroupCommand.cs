using System;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Commands.CreateGroup
{
    public class CreateGroupCommand : IRequest<Guid>
    {
        public string Name { get; set; }

    }
}
