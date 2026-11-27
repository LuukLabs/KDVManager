using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class GetWaitlistEntryQueryHandler(IWaitlistEntryRepository repository)
{
    public async Task<WaitlistEntryVM> Handle(Guid id)
    {
        var entry = await repository.GetByIdAsync(id);
        if (entry is null) throw new Exceptions.NotFoundException(nameof(WaitlistEntry), id);
        return WaitlistEntryMapping.ToVm(entry);
    }
}
