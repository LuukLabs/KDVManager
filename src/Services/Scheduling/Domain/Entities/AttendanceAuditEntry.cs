using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.Scheduling.Domain.Entities;

/// <summary>Append-only evidence of an attendance state transition.</summary>
public class AttendanceAuditEntry : IMustHaveTenant
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid AttendanceRecordId { get; set; }
    public DateTimeOffset? PreviousCheckedInAt { get; set; }
    public DateTimeOffset? PreviousCheckedOutAt { get; set; }
    public DateTimeOffset? CheckedInAt { get; set; }
    public DateTimeOffset? CheckedOutAt { get; set; }
    public string ActorSubject { get; set; } = string.Empty;
    public DateTimeOffset OccurredAt { get; set; }
}
