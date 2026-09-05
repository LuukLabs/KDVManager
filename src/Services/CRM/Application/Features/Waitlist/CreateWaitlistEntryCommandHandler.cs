using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class CreateWaitlistEntryCommandHandler(IWaitlistEntryRepository waitlistEntryRepository)
{
    public async Task<Guid> Handle(CreateWaitlistEntryCommand request)
    {
        var validationResult = await new CreateWaitlistEntryCommandValidator().ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            throw new Exceptions.ValidationException(validationResult);
        }

        var entry = await waitlistEntryRepository.AddAsync(new WaitlistEntry
        {
            Id = Guid.NewGuid(),
            GivenName = request.GivenName!,
            FamilyName = request.FamilyName!,
            DateOfBirth = request.DateOfBirth!.Value,
            DesiredStartDate = request.DesiredStartDate!.Value,
            ContactName = request.ContactName!,
            ContactEmail = request.ContactEmail!,
            ContactPhone = request.ContactPhone,
            RequestedDays = request.RequestedDays,
            Notes = request.Notes,
            RegisteredAt = DateTimeOffset.UtcNow
        });

        return entry.Id;
    }
}
