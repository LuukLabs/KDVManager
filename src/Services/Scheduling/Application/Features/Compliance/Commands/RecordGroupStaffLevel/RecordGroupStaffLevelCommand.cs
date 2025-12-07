using System;

namespace KDVManager.Services.Scheduling.Application.Features.Compliance.Commands.RecordGroupStaffLevel;

public class RecordGroupStaffLevelCommand
{
    public Guid GroupId { get; set; }
    public int QualifiedStaffCount { get; set; }
    public DateTime EffectiveFromUtc { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
}
