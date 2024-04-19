using System;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Commands.DeleteGroup;

public class DeleteGroupCommand : IRequest
{
    public Guid Id { get; set; }
}
