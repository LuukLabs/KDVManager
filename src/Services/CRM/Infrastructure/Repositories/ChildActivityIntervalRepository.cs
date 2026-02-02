using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.CRM.Infrastructure.Repositories;

public class ChildActivityIntervalRepository : IChildActivityIntervalRepository
{
  private readonly ApplicationDbContext _dbContext;

  public ChildActivityIntervalRepository(ApplicationDbContext dbContext)
  {
    _dbContext = dbContext;
  }

  public async Task<IReadOnlyList<ChildActivityInterval>> GetByChildIdAsync(Guid childId)
  {
    return await _dbContext.ChildActivityIntervals
        .Where(i => i.ChildId == childId)
        .OrderBy(i => i.StartDate)
        .ToListAsync();
  }

  public async Task DeleteByChildIdAsync(Guid childId)
  {
    var intervals = await _dbContext.ChildActivityIntervals
        .Where(i => i.ChildId == childId)
        .ToListAsync();

    _dbContext.ChildActivityIntervals.RemoveRange(intervals);
    await _dbContext.SaveChangesAsync();
  }

  public async Task AddRangeAsync(IEnumerable<ChildActivityInterval> intervals)
  {
    await _dbContext.ChildActivityIntervals.AddRangeAsync(intervals);
    await _dbContext.SaveChangesAsync();
  }
}
