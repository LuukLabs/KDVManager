using System;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.Scheduling.Domain.Entities;

public class TimeSlot : IMustHaveTenant
{
    public Guid Id { get; set; }

    public Guid TenantId { get; set; }

    public string Name { get; set; } = string.Empty;

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }
}
