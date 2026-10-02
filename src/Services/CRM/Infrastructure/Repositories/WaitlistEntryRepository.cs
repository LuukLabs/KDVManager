using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Application.Exceptions;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Shared.Contracts.Enums;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.CRM.Infrastructure.Repositories;

public class WaitlistEntryRepository(ApplicationDbContext dbContext)
    : BaseRepository<WaitlistEntry>(dbContext), IWaitlistEntryRepository
{
    // Query explicitly: FindAsync may return an already tracked entity without applying tenant filters.
    public new async Task<WaitlistEntry> GetByIdAsync(Guid id) =>
        (await _dbContext.WaitlistEntries.Include(entry => entry.StatusHistory).SingleOrDefaultAsync(entry => entry.Id == id))!;

    public async Task<IReadOnlyList<WaitlistEntry>> ListAsync(bool includeClosed, string? location = null,
        DateOnly? startMonth = null, WaitlistEntryStatus? status = null)
    {
        var entries = _dbContext.WaitlistEntries.AsNoTracking().AsQueryable();
        if (status.HasValue) entries = entries.Where(entry => entry.Status == status);
        else if (!includeClosed) entries = entries.Where(entry => entry.Status == WaitlistEntryStatus.Waiting || entry.Status == WaitlistEntryStatus.Offered);
        if (!string.IsNullOrWhiteSpace(location))
        {
            var normalizedLocation = location.Trim().ToLowerInvariant();
            entries = entries.Where(entry => entry.Location != null && entry.Location.ToLower() == normalizedLocation);
        }
        if (startMonth.HasValue)
        {
            var start = startMonth.Value;
            // Year 9999 December has no representable next month.
            var end = start == new DateOnly(9999, 12, 1) ? DateOnly.MaxValue : start.AddMonths(1);
            entries = start == new DateOnly(9999, 12, 1)
                ? entries.Where(entry => entry.DesiredStartDate >= start)
                : entries.Where(entry => entry.DesiredStartDate >= start && entry.DesiredStartDate < end);
        }
        return await entries.OrderBy(entry => entry.Status == WaitlistEntryStatus.Offered ? 0 : entry.Status == WaitlistEntryStatus.Waiting ? 1 : entry.Status == WaitlistEntryStatus.Placed ? 2 : 3)
            .ThenByDescending(entry => entry.Priority).ThenBy(entry => entry.RegisteredAt).ThenBy(entry => entry.Id)
            .ToListAsync();
    }

    public new async Task UpdateAsync(WaitlistEntry entity)
    {
        try { await base.UpdateAsync(entity); }
        catch (DbUpdateConcurrencyException) { throw new ConflictException(nameof(WaitlistEntry), entity.Id); }
    }
}
