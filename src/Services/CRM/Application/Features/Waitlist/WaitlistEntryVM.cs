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
}
