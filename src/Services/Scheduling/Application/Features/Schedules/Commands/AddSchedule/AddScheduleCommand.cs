using System;
using MediatR;
using System.Collections.Generic;
namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.AddSchedule;

public class AddScheduleCommand : IRequest<Guid>
{
    public Guid ChildId { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    // Collection of nested schedules
    public ICollection<AddScheduleCommandScheduleRule> ScheduleRules { get; set; } = new List<AddScheduleCommandScheduleRule>();

    public class AddScheduleCommandScheduleRule
    {
        public DayOfWeek Day { get; set; }

        public Guid TimeSlotId { get; set; }

        public Guid GroupId { get; set; }
    }
}
