using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.Scheduling.Application.Features.GroupSummary.Queries.GetGroupSummary;

public class GroupSummaryVM
{
    public required Guid GroupId { get; set; }
    public required string GroupName { get; set; } = string.Empty;
    public required DateOnly Date { get; set; }

    [Required]
    public required List<TimeBlockSummary> TimeBlocks { get; set; } = new List<TimeBlockSummary>();

    public int RequiredProfessionals { get; set; } = 0;
    public int NumberOfChildren { get; set; } = 0;
}

public class TimeBlockSummary
{
    public required TimeOnly StartTime { get; set; }
    public required TimeOnly EndTime { get; set; }
    public required string TimeSlotName { get; set; } = string.Empty;
    public required int TotalChildren { get; set; }
    public required int RequiredProfessionals { get; set; } = 0;
    public required List<AgeGroupSummary> AgeGroups { get; set; } = new List<AgeGroupSummary>();
}

public class AgeGroupSummary
{
    public string AgeRange { get; set; } = string.Empty;
    public int ChildCount { get; set; }
}
