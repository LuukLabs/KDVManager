using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public class EndMarkRepository : BaseRepository<EndMark>, IEndMarkRepository
{
    public EndMarkRepository(ApplicationDbContext dbContext) : base(dbContext) { }

    public async Task<IReadOnlyList<EndMark>> GetByChildIdAsync(Guid childId)
    {
        return await _dbContext.EndMarks.Where(em => em.ChildId == childId).OrderBy(em => em.EndDate).ToListAsync();
    }

    public async Task<IReadOnlyList<EndMark>> GetSystemGeneratedByChildIdAsync(Guid childId)
    {
        return await _dbContext.EndMarks
            .Where(em => em.ChildId == childId && em.IsSystemGenerated)
            .OrderBy(em => em.EndDate)
            .ToListAsync();
    }
}
