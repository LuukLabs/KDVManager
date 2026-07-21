using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Shared.Application.Contracts.Pagination;
using KDVManager.Services.Scheduling.Domain.Services;
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

    public async Task<Schedule?> GetWithRulesByIdAsync(Guid id)
    {
        return await _dbContext.Schedules
            .Include(s => s.ScheduleRules)
            .SingleOrDefaultAsync(s => s.Id == id);
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

    public async Task<bool> ExistsWithStartDateExceptAsync(Guid childId, DateOnly startDate, Guid excludedScheduleId)
    {
        return await _dbContext.Schedules.AnyAsync(s =>
            s.ChildId == childId &&
            s.StartDate == startDate &&
            s.Id != excludedScheduleId);
    }

    public async Task ReplaceRulesAndRecalculateAsync(Schedule schedule, ICollection<ScheduleRule> replacementRules)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync();

        // The schedule is loaded with its rules by GetWithRulesByIdAsync. Save the
        // replacement first so the following timeline query sees the new state.
        _dbContext.ScheduleRules.RemoveRange(schedule.ScheduleRules);
        schedule.ScheduleRules = replacementRules;

        // The rules have application-assigned IDs. Explicitly marking them as
        // added keeps EF from inferring a modification from their non-default
        // key, which in turn lets the tenancy change tracker stamp them with
        // the current tenant.
        _dbContext.ScheduleRules.AddRange(replacementRules);
        await _dbContext.SaveChangesAsync();

        var schedules = await _dbContext.Schedules
            .Where(s => s.ChildId == schedule.ChildId)
            .OrderBy(s => s.StartDate)
            .ToListAsync();
        var endMarks = await _dbContext.EndMarks
            .Where(endMark => endMark.ChildId == schedule.ChildId)
            .ToListAsync();

        ScheduleEndDateCalculator.Recalculate(schedules, endMarks);
        await _dbContext.SaveChangesAsync();

        await transaction.CommitAsync();
    }
}
