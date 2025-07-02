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
        public string TimeSlotName { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public Guid GroupId { get; set; }
        public string GroupName { get; set; }
    }
}

