namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class GetWaitlistEntriesQuery
{
    /// <summary>Also return placed and withdrawn requests.</summary>
    public bool? IncludeClosed { get; init; }
}
