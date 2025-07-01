using System;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.DeleteSchedule;

public class DeleteScheduleCommand : IRequest
{
    public Guid Id { get; set; }
}
