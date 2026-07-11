using System;
using System.Collections.Generic;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.UpdateSchedule;

/// <summary>
/// Replaces the rules of an existing schedule. The schedule's child and tenant are
/// deliberately not part of this command; both are derived from the existing record.
/// </summary>
public class UpdateScheduleCommand
{
    public DateOnly StartDate { get; set; }

    public ICollection<UpdateScheduleCommandScheduleRule> ScheduleRules { get; set; } = new List<UpdateScheduleCommandScheduleRule>();

    public class UpdateScheduleCommandScheduleRule
    {
        public DayOfWeek Day { get; set; }

        public Guid TimeSlotId { get; set; }

        public Guid GroupId { get; set; }
    }
}
