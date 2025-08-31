using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public class ClosurePeriodRepository : BaseRepository<ClosurePeriod>, IClosurePeriodRepository
{
    public ClosurePeriodRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public new async Task<IReadOnlyList<ClosurePeriod>> ListAllAsync()
    {
        return await _dbContext.Set<ClosurePeriod>()
            .OrderBy(cp => cp.StartDate)
            .ThenBy(cp => cp.EndDate)
            .ToListAsync();
    }

    public async Task<List<ClosurePeriod>> ListByYearAsync(int year)
    {
        return await _dbContext.ClosurePeriods
            .Where(cd => cd.StartDate.Year == year)
            .OrderBy(cd => cd.StartDate)
            .ToListAsync();
    }

    public async Task<List<ClosurePeriod>> ListByDateRangeAsync(DateOnly from, DateOnly to)
    {
        return await _dbContext.ClosurePeriods
            .Where(cd => cd.StartDate <= to && cd.EndDate >= from)
            .OrderBy(cd => cd.StartDate)
            .ToListAsync();
    }
}
