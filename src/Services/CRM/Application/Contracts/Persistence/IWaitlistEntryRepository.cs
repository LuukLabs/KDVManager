using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Contracts.Persistence;

public interface IWaitlistEntryRepository : IAsyncRepository<WaitlistEntry>
{
    Task<IReadOnlyList<WaitlistEntry>> ListAsync(bool includeClosed);
}
