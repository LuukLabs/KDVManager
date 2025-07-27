using System;

namespace KDVManager.Services.Scheduling.Application.Features.ClosurePeriods.Commands.AddClosurePeriod;

public class AddClosurePeriodCommand
{
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string Reason { get; set; } = string.Empty;
}
