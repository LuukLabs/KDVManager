using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public class CalendarRowCacheRepository : BaseRepository<CalendarRowCache>, ICalendarRowCacheRepository
{
    public CalendarRowCacheRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public Task<List<CalendarRowCache>> GetGroupRangeAsync(Guid groupId, DateOnly startDate, DateOnly endDate)
    {
        return _dbContext.CalendarRowCaches
            .Where(c => c.GroupId == groupId && c.Date >= startDate && c.Date <= endDate)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task DeleteGroupRangeAsync(Guid groupId, DateOnly startDate, DateOnly endDate)
    {
        var rows = await _dbContext.CalendarRowCaches
            .Where(c => c.GroupId == groupId && c.Date >= startDate && c.Date <= endDate)
            .ToListAsync();
        if (rows.Count == 0) return;
        _dbContext.CalendarRowCaches.RemoveRange(rows);
        await _dbContext.SaveChangesAsync();
    }

    public async Task DeleteGroupAsync(Guid groupId)
    {
        var rows = await _dbContext.CalendarRowCaches
            .Where(c => c.GroupId == groupId)
            .ToListAsync();
        if (rows.Count == 0) return;
        _dbContext.CalendarRowCaches.RemoveRange(rows);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<List<(DateOnly Date, TimeOnly Start, TimeOnly End, int Present, int Absent, int Closed)>> GetGroupedStatusCountsAsync(Guid groupId, DateOnly startDate, DateOnly endDate)
    {
        return await _dbContext.CalendarRowCaches
            .Where(c => c.GroupId == groupId && c.Date >= startDate && c.Date <= endDate)
            .GroupBy(c => new { c.Date, c.StartTime, c.EndTime })
            .Select(g => new ValueTuple<DateOnly, TimeOnly, TimeOnly, int, int, int>(
                g.Key.Date,
                g.Key.StartTime,
                g.Key.EndTime,
                g.Count(r => r.Status == "present"),
                g.Count(r => r.Status == "absent"),
                g.Count(r => r.Status == "closed")
            ))
            .ToListAsync();
    }
}
