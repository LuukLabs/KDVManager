using System;
using System.Collections.Generic;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetSchedulesByDate;

public class ScheduleByDateVM
{
    public Guid ScheduleId { get; set; }
    public Guid ChildId { get; set; }
    public string TimeSlotName { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public Guid GroupId { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public int? Age { get; set; }
}
