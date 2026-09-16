using KDVManager.Shared.Contracts.Enums;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.CRM.Domain.Entities;

/// <summary>
/// A prospective child's request for childcare. It intentionally remains separate
/// from <see cref="Child"/> until the family is actually placed.
/// </summary>
public class WaitlistEntry : IMustHaveTenant
{
    public Guid Id { get; set; }

    public Guid TenantId { get; set; }

    public required string GivenName { get; set; }

    public required string FamilyName { get; set; }

    public DateOnly DateOfBirth { get; set; }

    public DateOnly DesiredStartDate { get; set; }

    public required string ContactName { get; set; }

    public required string ContactEmail { get; set; }

    public string? ContactPhone { get; set; }

    /// <summary>Free-text preference, for example "Monday and Thursday".</summary>
    public string? RequestedDays { get; set; }

    public string? Notes { get; set; }

    public DateTimeOffset RegisteredAt { get; set; }

    public WaitlistEntryStatus Status { get; private set; } = WaitlistEntryStatus.Waiting;

    public void ChangeStatus(WaitlistEntryStatus status) => Status = status;
}
