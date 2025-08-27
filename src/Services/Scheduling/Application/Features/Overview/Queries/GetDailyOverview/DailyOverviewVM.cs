using System;
using System.Collections.Generic;

namespace KDVManager.Services.Scheduling.Application.Features.Overview.Queries.GetDailyOverview;

public class DailyOverviewVM
{
    public DateOnly Date { get; set; }
    public bool IsClosed { get; set; }
    public string? ClosureReason { get; set; }
    public List<GroupDailyOverviewVM> Groups { get; set; } = new();
}

public class GroupDailyOverviewVM
{
    public Guid GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public List<ChildScheduleDailyVM> Schedules { get; set; } = new();
}

public class ChildScheduleDailyVM
{
    public Guid ScheduleId { get; set; }
    public Guid ChildId { get; set; }
    public string TimeSlotName { get; set; } = string.Empty;
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public int? Age { get; set; }
    public bool IsAbsent { get; set; }
    public string? AbsenceReason { get; set; }
}
