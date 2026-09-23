using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class UpdateWaitlistEntryStatusCommandHandler(IWaitlistEntryRepository waitlistEntryRepository)
{
    public async Task Handle(Guid id, UpdateWaitlistEntryStatusCommand request)
    {
        var entry = await waitlistEntryRepository.GetByIdAsync(id);
        if (entry is null)
        {
            throw new Exceptions.NotFoundException(nameof(WaitlistEntry), id);
        }

        entry.ChangeStatus(request.Status);
        await waitlistEntryRepository.UpdateAsync(entry);
    }
}
