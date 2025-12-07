using System;
using KDVManager.Services.Scheduling.Domain.Interfaces;

namespace KDVManager.Services.Scheduling.Domain.Entities;

public class GroupStaffLevel : IMustHaveTenant
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid GroupId { get; set; }
    public DateTime EffectiveFromUtc { get; set; }
    public int QualifiedStaffCount { get; set; }
    public string? Notes { get; set; }
}
