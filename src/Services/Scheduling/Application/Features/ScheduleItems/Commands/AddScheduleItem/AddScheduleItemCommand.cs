using System;
using MediatR;
using System.Collections.Generic;

namespace KDVManager.Services.Scheduling.Application.Features.ScheduleItems.Commands.AddScheduleItem;

public class AddScheduleItemCommand : IRequest<Guid>
{
    public Guid ChildId { get; set; }

    public Guid GroupId { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    // Collection of nested schedules
    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();

    public class Schedule
    {
        public DayOfWeek Day { get; set; }
    }
}
