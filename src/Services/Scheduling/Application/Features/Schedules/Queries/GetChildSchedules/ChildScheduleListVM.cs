using System;
using System.Collections.Generic;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetChildSchedules;

public class ChildScheduleListVM
{
    public Guid Id { get; set; }
    public Guid ChildId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    // Collection of nested schedules
    public ICollection<ChildScheduleListVMScheduleRule> ScheduleRules { get; set; } = new List<ChildScheduleListVMScheduleRule>();

    public class ChildScheduleListVMScheduleRule
    {
        public DayOfWeek Day { get; set; }

        public Guid TimeSlotId { get; set; }
    }
}

