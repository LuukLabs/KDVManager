using System;

namespace KDVManager.Services.Scheduling.Application.Features.LongTermPlanning.Queries.GetLongTermPlanning;

public class GetLongTermPlanningQuery
{
    /// <summary>Optional group to filter on; when omitted returns data for each group aggregated separately (currently returns empty blocks until implemented).</summary>
    public Guid? GroupId { get; set; }
    /// <summary>Start date (inclusive)</summary>
    public DateOnly StartDate { get; set; }
    /// <summary>Number of days to include (default 28, max 90)</summary>
    public int Days { get; set; } = 28;
}
