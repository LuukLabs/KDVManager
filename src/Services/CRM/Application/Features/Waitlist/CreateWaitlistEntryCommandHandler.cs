using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class CreateWaitlistEntryCommandHandler(IWaitlistEntryRepository waitlistEntryRepository)
{
    public async Task<Guid> Handle(CreateWaitlistEntryCommand request)
    {
        var validationResult = await new CreateWaitlistEntryCommandValidator().ValidateAsync(request);
        if (!validationResult.IsValid) throw new Exceptions.ValidationException(validationResult);

        var entry = new WaitlistEntry
        {
            Id = Guid.NewGuid(), GivenName = request.GivenName!, FamilyName = request.FamilyName!,
            ContactName = request.ContactName!, ContactEmail = request.ContactEmail!,
            RegisteredAt = DateTimeOffset.UtcNow
        };
        WaitlistEntryMapping.Apply(entry, request);
        await waitlistEntryRepository.AddAsync(entry);
        return entry.Id;
    }
}
