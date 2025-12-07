using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public class GroupComplianceSnapshotRepository : BaseRepository<GroupComplianceSnapshot>, IGroupComplianceSnapshotRepository
{
    public GroupComplianceSnapshotRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<GroupComplianceSnapshot?> GetLatestAsync(Guid groupId)
    {
        return await _dbContext.Set<GroupComplianceSnapshot>()
            .Where(s => s.GroupId == groupId)
            .OrderByDescending(s => s.CapturedAtUtc)
            .FirstOrDefaultAsync();
    }

    public async Task<IReadOnlyList<GroupComplianceSnapshot>> GetRangeAsync(Guid groupId, DateTime fromUtc, DateTime toUtc)
    {
        return await _dbContext.Set<GroupComplianceSnapshot>()
            .Where(s => s.GroupId == groupId && s.CapturedAtUtc >= fromUtc && s.CapturedAtUtc <= toUtc)
            .OrderByDescending(s => s.CapturedAtUtc)
            .ToListAsync();
    }
}
