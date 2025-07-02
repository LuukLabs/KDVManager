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
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Schedule>> GetSchedulesByDateAsync(DateOnly date, Guid groupId)
    {
        var dayOfWeek = date.DayOfWeek;
        var dateUtc = DateTime.SpecifyKind(date.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);

        return await _dbContext.Schedules
            .Where(s =>
                s.StartDate <= dateUtc &&
                (!s.EndDate.HasValue || s.EndDate >= dateUtc)
            )
            .Include(s => s.ScheduleRules.Where(sr => sr.Day == dayOfWeek && sr.GroupId == groupId))
                .ThenInclude(sr => sr.TimeSlot)
            .Where(s => s.ScheduleRules.Any(sr => sr.Day == dayOfWeek && sr.GroupId == groupId))
            .ToListAsync();
    }
}
