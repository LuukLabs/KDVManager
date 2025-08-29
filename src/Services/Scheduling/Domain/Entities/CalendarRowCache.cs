using System;
using KDVManager.Services.Scheduling.Domain.Interfaces;

namespace KDVManager.Services.Scheduling.Domain.Entities;

public class CalendarRowCache : IMustHaveTenant
{
    public Guid Id { get; set; } // surrogate key
    public Guid TenantId { get; set; }
    public Guid GroupId { get; set; }
    public Guid ChildId { get; set; }
    public DateOnly Date { get; set; }
    public Guid SlotId { get; set; }
    public string SlotName { get; set; } = string.Empty;
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public string Status { get; set; } = string.Empty; // present | absent | closed
    public string? Reason { get; set; }
    public DateTime CachedAtUtc { get; set; } = DateTime.UtcNow; // for TTL logic if needed
    public DateOnly Birthday { get; set; }
    public int Age { get; set; }
}
