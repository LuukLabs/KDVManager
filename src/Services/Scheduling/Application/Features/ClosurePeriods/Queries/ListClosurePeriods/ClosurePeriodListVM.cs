using System;

namespace KDVManager.Services.Scheduling.Application.Features.ClosurePeriods.Queries.ListClosurePeriods;

public class ClosurePeriodListVM
{
    public Guid Id { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string Reason { get; set; } = string.Empty;

}

