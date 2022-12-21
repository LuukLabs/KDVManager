using System;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Commands.AddGroup;

public class AddGroupCommand : IRequest<Guid>
{
    public string Name { get; set; }
}
