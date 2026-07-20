using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public class ChildRepository : BaseRepository<Child, ApplicationDbContext>, IChildRepository
{
    public ChildRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<List<Child>> GetChildrenByIdsAsync(List<Guid> childIds)
    {
        return await _dbContext.Children
            .Where(c => childIds.Contains(c.Id))
            .ToListAsync();
    }
}
