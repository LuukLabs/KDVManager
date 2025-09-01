using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public class AbsenceRepository : BaseRepository<Absence>, IAbsenceRepository
{
    public AbsenceRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<List<Absence>> GetByChildIdAsync(Guid childId)
    {
        return await _dbContext.Absences.Where(a => a.ChildId == childId).ToListAsync();
    }

    public async Task<List<Absence>> GetByChildIdsAsync(IEnumerable<Guid> childIds)
    {
        var ids = childIds.Distinct().ToList();
        if (!ids.Any()) return new List<Absence>();
        return await _dbContext.Absences.Where(a => ids.Contains(a.ChildId)).ToListAsync();
    }

    public async Task<List<Absence>> GetByChildIdsAndDateRangeAsync(IEnumerable<Guid> childIds, DateOnly from, DateOnly to)
    {
        var ids = childIds.Distinct().ToList();
        if (!ids.Any()) return new List<Absence>();
        return await _dbContext.Absences
            .Where(a => ids.Contains(a.ChildId) && a.StartDate <= to && a.EndDate >= from)
            .ToListAsync();
    }

}

