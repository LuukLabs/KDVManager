using KDVManager.Shared.Contracts.Enums;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class WaitlistEntryVM
{
    public Guid Id { get; init; }
    public required string GivenName { get; init; }
    public required string FamilyName { get; init; }
    public required string FullName { get; init; }
    public DateOnly DateOfBirth { get; init; }
    public DateOnly DesiredStartDate { get; init; }
    public required string ContactName { get; init; }
    public required string ContactEmail { get; init; }
    public string? ContactPhone { get; init; }
    public string? RequestedDays { get; init; }
    public string? Notes { get; init; }
    public DateTimeOffset RegisteredAt { get; init; }
    public WaitlistEntryStatus Status { get; init; }
    public string? Location { get; init; }
    public ChildcareType? CareType { get; init; }
    public string? PreferredGroup { get; init; }
    public int[] Weekdays { get; init; } = [];
    public TimeOnly? StartTime { get; init; }
    public TimeOnly? EndTime { get; init; }
    public int Priority { get; init; }
    public string? PriorityReason { get; init; }
    public string? PriorityExplanation { get; init; }
    public Guid Revision { get; init; }
    public IReadOnlyList<WaitlistStatusChangeVM> StatusHistory { get; init; } = [];

}
