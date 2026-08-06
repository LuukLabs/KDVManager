using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.Scheduling.Domain.Entities;

/// <summary>Actual presence for one child on one calendar day. All timestamps are stored as UTC.</summary>
public class AttendanceRecord : IMustHaveTenant
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid ChildId { get; set; }
    public DateOnly Date { get; set; }
    public DateTimeOffset? CheckedInAt { get; set; }
    public DateTimeOffset? CheckedOutAt { get; set; }
    public string CreatedBySubject { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
