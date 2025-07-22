using System;
using System.Collections.Generic;

namespace KDVManager.Services.Scheduling.Application.Features.GroupSummary.Queries.GetGroupSummary;

public class GroupSummaryVM
{
    public Guid GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public List<TimeBlockSummary> TimeBlocks { get; set; } = new List<TimeBlockSummary>();
}

public class TimeBlockSummary
{
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public string TimeSlotName { get; set; } = string.Empty;
    public int TotalChildren { get; set; }
    public int RequiredSupervisors { get; set; }
    public List<AgeGroupSummary> AgeGroups { get; set; } = new List<AgeGroupSummary>();
}

public class AgeGroupSummary
{
    public string AgeRange { get; set; } = string.Empty;
    public int ChildCount { get; set; }
}
