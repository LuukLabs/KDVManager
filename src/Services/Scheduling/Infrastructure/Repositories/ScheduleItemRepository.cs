using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public class ScheduleItemRepository : BaseRepository<ScheduleItem>, IScheduleItemRepository
{
    public ScheduleItemRepository(SchedulingDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<IReadOnlyList<ScheduleItem>> GetScheduleItemsByChildIdAsync(Guid childId)
    {
        return await _dbContext.ScheduleItems
            .Where(si => si.ChildId == childId)
            .OrderByDescending(si => si.StartDate)
            .ThenBy(si => si.EndDate)
            .ToListAsync();
    }
}
