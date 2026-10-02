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

    // Preference labels, not capacity claims or cross-service foreign keys.
    public string? Location { get; set; }
    public ChildcareType? CareType { get; set; }
    public string? PreferredGroup { get; set; }
    public int[] Weekdays { get; set; } = [];
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public int Priority { get; set; }
    public string? PriorityReason { get; set; }
    public string? PriorityExplanation { get; set; }
    public Guid Revision { get; set; } = Guid.NewGuid();
    public List<WaitlistStatusChange> StatusHistory { get; set; } = [];

    public void ChangeStatus(WaitlistEntryStatus status, string changedBy, DateTimeOffset changedAt)
    {
        if (!Enum.IsDefined(status)) throw new ArgumentOutOfRangeException(nameof(status));
        if (string.IsNullOrWhiteSpace(changedBy)) throw new ArgumentException("An authenticated actor is required.", nameof(changedBy));
        if (Status == status) return;

        StatusHistory.Add(new WaitlistStatusChange
        {
            Id = Guid.NewGuid(), TenantId = TenantId, WaitlistEntryId = Id,
            PreviousStatus = Status, Status = status, ChangedBy = changedBy, ChangedAt = changedAt
        });
        Status = status;
        Revision = Guid.NewGuid();
    }
}
