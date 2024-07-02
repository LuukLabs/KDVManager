using System;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.ScheduleItems.Commands.AddScheduleItem;

public class AddScheduleItemCommand : IRequest<Guid>
{
    public string Name { get; set; }
    public Guid ChildId { get; set; }
}
