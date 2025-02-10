using System;

namespace KDVManager.Services.Scheduling.Domain.Entities;

public class TimeSlot
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}
