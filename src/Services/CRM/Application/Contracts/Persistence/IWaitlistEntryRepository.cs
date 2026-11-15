using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Contracts.Persistence;

public interface IWaitlistEntryRepository : IAsyncRepository<WaitlistEntry>
{
    Task<IReadOnlyList<WaitlistEntry>> ListAsync(bool includeClosed, string? location = null, DateOnly? startMonth = null, KDVManager.Shared.Contracts.Enums.WaitlistEntryStatus? status = null);
}
