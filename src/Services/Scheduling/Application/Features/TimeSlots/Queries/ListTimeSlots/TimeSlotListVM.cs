using System;

namespace KDVManager.Services.Scheduling.Application.Features.TimeSlots.Queries.ListTimeSlots;

public class TimeSlotListVM
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}
