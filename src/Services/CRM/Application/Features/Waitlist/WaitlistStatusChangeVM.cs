using KDVManager.Shared.Contracts.Enums;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class WaitlistStatusChangeVM
{
    public WaitlistEntryStatus PreviousStatus { get; init; }
    public WaitlistEntryStatus Status { get; init; }
    public required string ChangedBy { get; init; }
    public DateTimeOffset ChangedAt { get; init; }
}
