using KDVManager.Shared.Contracts.Enums;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.CRM.Domain.Entities;

public class WaitlistStatusChange : IMustHaveTenant
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid WaitlistEntryId { get; set; }
    public WaitlistEntryStatus PreviousStatus { get; set; }
    public WaitlistEntryStatus Status { get; set; }
    public required string ChangedBy { get; set; }
    public DateTimeOffset ChangedAt { get; set; }
}
