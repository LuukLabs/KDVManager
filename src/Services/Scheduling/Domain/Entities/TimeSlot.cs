using System;
using KDVManager.Services.Scheduling.Domain.Interfaces;

namespace KDVManager.Services.Scheduling.Domain.Entities;

public class TimeSlot : IMustHaveTenant
{
    public Guid Id { get; set; }

    public Guid TenantId { get; set; }

    public string Name { get; set; } = string.Empty;

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }
}
