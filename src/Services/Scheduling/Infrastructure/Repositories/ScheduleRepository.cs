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
}
