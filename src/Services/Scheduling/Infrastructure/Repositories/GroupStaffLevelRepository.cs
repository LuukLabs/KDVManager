using System;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public class GroupStaffLevelRepository : BaseRepository<GroupStaffLevel>, IGroupStaffLevelRepository
{
    public GroupStaffLevelRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<GroupStaffLevel?> GetLatestForGroupAsync(Guid groupId, DateTime atUtc)
    {
        return await _dbContext.Set<GroupStaffLevel>()
            .Where(s => s.GroupId == groupId && s.EffectiveFromUtc <= atUtc)
            .OrderByDescending(s => s.EffectiveFromUtc)
            .FirstOrDefaultAsync();
    }
}
