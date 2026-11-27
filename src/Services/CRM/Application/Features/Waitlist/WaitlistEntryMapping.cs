using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

internal static class WaitlistEntryMapping
{
    public static void Apply(WaitlistEntry entry, CreateWaitlistEntryCommand request)
    {
        entry.GivenName = request.GivenName!.Trim();
        entry.FamilyName = request.FamilyName!.Trim();
        entry.DateOfBirth = request.DateOfBirth!.Value;
        entry.DesiredStartDate = request.DesiredStartDate!.Value;
        entry.ContactName = request.ContactName!.Trim();
        entry.ContactEmail = request.ContactEmail!.Trim();
        entry.ContactPhone = Clean(request.ContactPhone);
        entry.RequestedDays = Clean(request.RequestedDays);
        entry.Notes = Clean(request.Notes);
        entry.Location = Clean(request.Location);
        entry.CareType = request.CareType;
        entry.PreferredGroup = Clean(request.PreferredGroup);
        entry.Weekdays = request.Weekdays.Order().ToArray();
        entry.StartTime = request.StartTime;
        entry.EndTime = request.EndTime;
        entry.Priority = request.Priority;
        entry.PriorityReason = Clean(request.PriorityReason);
        entry.PriorityExplanation = Clean(request.PriorityExplanation);
        entry.Revision = Guid.NewGuid();
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    public static WaitlistEntryVM ToVm(WaitlistEntry entry) => new()
    {
        Id = entry.Id, GivenName = entry.GivenName, FamilyName = entry.FamilyName,
        FullName = $"{entry.GivenName} {entry.FamilyName}", DateOfBirth = entry.DateOfBirth,
        DesiredStartDate = entry.DesiredStartDate, ContactName = entry.ContactName,
        ContactEmail = entry.ContactEmail, ContactPhone = entry.ContactPhone,
        RequestedDays = entry.RequestedDays, Notes = entry.Notes, RegisteredAt = entry.RegisteredAt,
        Status = entry.Status, Location = entry.Location, CareType = entry.CareType,
        PreferredGroup = entry.PreferredGroup, Weekdays = entry.Weekdays,
        StartTime = entry.StartTime, EndTime = entry.EndTime, Priority = entry.Priority,
        PriorityReason = entry.PriorityReason, PriorityExplanation = entry.PriorityExplanation,
        Revision = entry.Revision,
        StatusHistory = entry.StatusHistory.OrderByDescending(change => change.ChangedAt).Select(change => new WaitlistStatusChangeVM
        {
            PreviousStatus = change.PreviousStatus, Status = change.Status,
            ChangedBy = change.ChangedBy, ChangedAt = change.ChangedAt
        }).ToList()
    };
}
