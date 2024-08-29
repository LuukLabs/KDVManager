using System;
using MediatR;
using System.Collections.Generic;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.AddSchedule;

public class AddScheduleCommand : IRequest<Guid>
{
    public Guid ChildId { get; set; }

    public Guid GroupId { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    // Collection of nested schedules
    public ICollection<ScheduleRule> ScheduleRules { get; set; } = new List<ScheduleRule>();

    public class ScheduleRule
    {
        public DayOfWeek Day { get; set; }

        public Guid TimeSlotId { get; set; }
    }
}
