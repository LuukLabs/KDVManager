using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class UpdateWaitlistEntryCommandHandler(IWaitlistEntryRepository repository)
{
    public async Task Handle(Guid id, UpdateWaitlistEntryCommand request)
    {
        var validation = await new UpdateWaitlistEntryCommandValidator().ValidateAsync(request);
        if (!validation.IsValid) throw new Exceptions.ValidationException(validation);
        var entry = await repository.GetByIdAsync(id);
        if (entry is null) throw new Exceptions.NotFoundException(nameof(WaitlistEntry), id);
        if (entry.Revision != request.Revision) throw new Exceptions.ConflictException(nameof(WaitlistEntry), id);
        WaitlistEntryMapping.Apply(entry, request);
        await repository.UpdateAsync(entry);
    }
}
