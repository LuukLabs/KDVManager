using System;
using System.Collections.Generic;

namespace KDVManager.Services.Scheduling.Application.Features.PrintSchedules.Queries.GetPrintSchedules;

public class GetPrintSchedulesQuery
{
    public int Month { get; set; }
    public int Year { get; set; }
    /// <summary>
    /// (Deprecated) Single group id filter. Prefer using GroupIds.
    /// </summary>
    public Guid? GroupId { get; set; }
    /// <summary>
    /// Optional list of group ids to include. If empty/null all groups are included.
    /// </summary>
    public List<Guid>? GroupIds { get; set; }
}
