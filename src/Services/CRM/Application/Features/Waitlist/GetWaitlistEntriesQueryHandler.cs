using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class GetWaitlistEntriesQueryHandler(IWaitlistEntryRepository waitlistEntryRepository)
{
    public async Task<IReadOnlyList<WaitlistEntryVM>> Handle(GetWaitlistEntriesQuery request)
    {
        var entries = await waitlistEntryRepository.ListAsync(request.IncludeClosed ?? false);
        return entries.Select(ToVm).ToList();
    }

    private static WaitlistEntryVM ToVm(WaitlistEntry entry) => new()
    {
        Id = entry.Id,
        GivenName = entry.GivenName,
        FamilyName = entry.FamilyName,
        FullName = $"{entry.GivenName} {entry.FamilyName}",
        DateOfBirth = entry.DateOfBirth,
        DesiredStartDate = entry.DesiredStartDate,
        ContactName = entry.ContactName,
        ContactEmail = entry.ContactEmail,
        ContactPhone = entry.ContactPhone,
        RequestedDays = entry.RequestedDays,
        Notes = entry.Notes,
        RegisteredAt = entry.RegisteredAt,
        Status = entry.Status
    };
}
