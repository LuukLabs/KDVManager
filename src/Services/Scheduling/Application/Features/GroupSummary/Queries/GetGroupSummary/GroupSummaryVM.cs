using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace KDVManager.Services.Scheduling.Application.Features.GroupSummary.Queries.GetGroupSummary;

public class GroupSummaryVM
{
    public required Guid GroupId { get; set; }
    public required string GroupName { get; set; } = string.Empty;
    public required DateOnly Date { get; set; }

    [Required]
    public required List<TimeBlockSummary> TimeBlocks { get; set; } = new List<TimeBlockSummary>();

    // Null when no valid staffing ratio could be determined for any time block on this date
    public int? RequiredProfessionals { get; set; }
    public int NumberOfChildren { get; set; } = 0;
}

public class TimeBlockSummary
{
    public required TimeOnly StartTime { get; set; }
    public required TimeOnly EndTime { get; set; }
    public required string TimeSlotName { get; set; } = string.Empty;
    public required int TotalChildren { get; set; }
    // Null when the BKR calculator found no valid staffing ratio for this time block
    public int? RequiredProfessionals { get; set; }
    public required List<AgeGroupSummary> AgeGroups { get; set; } = new List<AgeGroupSummary>();

    [Required]
    public required BkrCalculationSummary Bkr { get; set; }
}

public class AgeGroupSummary
{
    public string AgeRange { get; set; } = string.Empty;
    public int ChildCount { get; set; }
}

/// <summary>
/// The BKR (beroepskracht-kindratio) reasoning behind a time block's required professionals,
/// as reported by the BKRCalculator library.
/// </summary>
public class BkrCalculationSummary
{
    public required bool HasSolution { get; set; }

    public required BkrProfessionalsBasis Basis { get; set; }

    /// <summary>The legal norm that matched the group composition; null when no rule applied.</summary>
    public BkrAppliedRule? AppliedRule { get; set; }
}

/// <summary>Which mechanism determined the number of professionals.</summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum BkrProfessionalsBasis
{
    None,
    GroupSizeMinimum,
    RatioCalculation,
    OneChildLessSafeguard
}

/// <summary>
/// One row of the BKR table. Ages follow the rule convention: MinAge inclusive, MaxAge exclusive.
/// </summary>
public class BkrAppliedRule
{
    public required int MinAge { get; set; }
    public required int MaxAge { get; set; }
    public required int MaxChildren { get; set; }
    public required int MinProfessionals { get; set; }

    [Required]
    public required List<BkrRuleConstraint> Constraints { get; set; } = new List<BkrRuleConstraint>();

    [Required]
    public required List<BkrAgeRatio> Ratios { get; set; } = new List<BkrAgeRatio>();
}

/// <summary>A sub-cap within the matched rule, e.g. "at most 8 children aged 0-1".</summary>
public class BkrRuleConstraint
{
    public required int MinAge { get; set; }
    public required int MaxAge { get; set; }
    public required int MaxChildren { get; set; }
}

/// <summary>One professional per MaxChildrenPerProfessional children of this age.</summary>
public class BkrAgeRatio
{
    public required int Age { get; set; }
    public required int MaxChildrenPerProfessional { get; set; }
}
