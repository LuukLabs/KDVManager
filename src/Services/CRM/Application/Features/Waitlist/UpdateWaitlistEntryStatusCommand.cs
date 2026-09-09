using KDVManager.Shared.Contracts.Enums;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class UpdateWaitlistEntryStatusCommand
{
    public WaitlistEntryStatus Status { get; init; }
}
