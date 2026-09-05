using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Shared.Contracts.Enums;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.CRM.Infrastructure.Repositories;

public class WaitlistEntryRepository(ApplicationDbContext dbContext)
    : BaseRepository<WaitlistEntry>(dbContext), IWaitlistEntryRepository
{
    public async Task<IReadOnlyList<WaitlistEntry>> ListAsync(bool includeClosed)
    {
        var entries = _dbContext.WaitlistEntries.AsQueryable();

        if (!includeClosed)
        {
            entries = entries.Where(entry =>
                entry.Status == WaitlistEntryStatus.Waiting || entry.Status == WaitlistEntryStatus.Offered);
        }

        return await entries
            // Offers need follow-up before new requests, then use registration order.
            .OrderBy(entry => entry.Status == WaitlistEntryStatus.Offered ? 0 : 1)
            .ThenBy(entry => entry.RegisteredAt)
            .ToListAsync();
    }
}
