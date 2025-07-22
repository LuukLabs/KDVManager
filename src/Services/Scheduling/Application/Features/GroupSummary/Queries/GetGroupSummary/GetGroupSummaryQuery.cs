using System;

namespace KDVManager.Services.Scheduling.Application.Features.GroupSummary.Queries.GetGroupSummary;

public class GetGroupSummaryQuery
{
    public Guid GroupId { get; set; }
    public DateOnly Date { get; set; }
}
