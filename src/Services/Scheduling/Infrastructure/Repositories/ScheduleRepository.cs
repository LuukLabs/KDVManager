using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public class ScheduleRepository : BaseRepository<Schedule>, IScheduleRepository
{
    public ScheduleRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<IReadOnlyList<Schedule>> GetSchedulesByChildIdAsync(Guid childId)
    {
        return await _dbContext.Schedules
            .Where(si => si.ChildId == childId)
            .OrderByDescending(si => si.StartDate)
            .ThenBy(si => si.EndDate)
            .Include(s => s.ScheduleRules)
                .ThenInclude(sr => sr.TimeSlot)
            .Include(s => s.ScheduleRules)
                .ThenInclude(sr => sr.Group)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Schedule>> GetSchedulesByDateAsync(DateOnly date, Guid groupId)
    {
        var dayOfWeek = date.DayOfWeek;
        // DateOnly is already date-only, so use as is for comparisons
        return await _dbContext.Schedules
            .Where(s =>
                s.StartDate <= date &&
                (!s.EndDate.HasValue || s.EndDate >= date)
            )
            .Include(s => s.ScheduleRules.Where(sr => sr.Day == dayOfWeek && sr.GroupId == groupId))
                .ThenInclude(sr => sr.TimeSlot)
            .Include(s => s.ScheduleRules.Where(sr => sr.Day == dayOfWeek && sr.GroupId == groupId))
                .ThenInclude(sr => sr.Group)
            .Where(s => s.ScheduleRules.Any(sr => sr.Day == dayOfWeek && sr.GroupId == groupId))
            .ToListAsync();
    }

    public async Task<bool> IsGroupUsedAsync(Guid groupId)
    {
        return await _dbContext.ScheduleRules.AnyAsync(sr => sr.GroupId == groupId);
    }

    public async Task DeleteSchedulesByChildIdAsync(Guid childId)
    {
        var schedulesToDelete = await _dbContext.Schedules
            .Where(s => s.ChildId == childId)
            .ToListAsync();

        if (schedulesToDelete.Any())
        {
            _dbContext.Schedules.RemoveRange(schedulesToDelete);
            await _dbContext.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsWithStartDateAsync(Guid childId, DateOnly startDate)
    {
        return await _dbContext.Schedules.AnyAsync(s => s.ChildId == childId && s.StartDate == startDate);
    }

    public async Task<IReadOnlyList<Schedule>> GetSchedulesForGroupInRangeAsync(Guid groupId, DateOnly startDate, DateOnly endDate)
    {
        var neededDays = new HashSet<DayOfWeek>();
        for (var d = startDate; d <= endDate; d = d.AddDays(1)) neededDays.Add(d.DayOfWeek);

        return await _dbContext.Schedules
            .Where(s => s.StartDate <= endDate && (!s.EndDate.HasValue || s.EndDate >= startDate))
            .Include(s => s.ScheduleRules.Where(sr => sr.GroupId == groupId && neededDays.Contains(sr.Day)))
                .ThenInclude(sr => sr.TimeSlot)
            .Include(s => s.ScheduleRules.Where(sr => sr.GroupId == groupId && neededDays.Contains(sr.Day)))
                .ThenInclude(sr => sr.Group)
            .Where(s => s.ScheduleRules.Any(sr => sr.GroupId == groupId && neededDays.Contains(sr.Day)))
            .ToListAsync();
    }
}
