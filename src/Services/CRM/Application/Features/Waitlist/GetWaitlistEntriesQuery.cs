using KDVManager.Shared.Contracts.Enums;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class GetWaitlistEntriesQuery
{
    public bool? IncludeClosed { get; init; }
    public string? Location { get; init; }
    /// <summary>First day of the desired start month, e.g. 2026-10-01.</summary>
    public DateOnly? StartMonth { get; init; }
    public WaitlistEntryStatus? Status { get; init; }
}
