﻿using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public class GroupRepository : BaseRepository<Group>, IGroupRepository
{
    public GroupRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<IReadOnlyList<Group>> PagedAsync(IPaginationFilter paginationFilter)
    {
        int skip = (paginationFilter.PageNumber - 1) * paginationFilter.PageSize;

        return await _dbContext.Set<Group>()
        .OrderBy(group => group.Name)
        .Skip((paginationFilter.PageNumber - 1) * paginationFilter.PageSize).Take(paginationFilter.PageSize)
        .ToListAsync();
    }

    public async Task<int> CountAsync()
    {
        return await _dbContext.Set<Group>().CountAsync();
    }

    public async Task<bool> IsGroupNameUnique(string name)
    {
        var matches = _dbContext.Groups.Any(e => e.Name.Equals(name));
        return await Task.FromResult(matches);
    }

    public async Task<IReadOnlyList<Group>> GetGroupsByIdsAsync(List<Guid> ids)
    {
        return await _dbContext.Groups
            .Where(g => ids.Contains(g.Id))
            .ToListAsync();
    }

    public async Task<bool> IsGroupUsedAsync(Guid groupId)
    {
        // Check if the group is referenced in any schedule rules
        var isUsedInRules = await _dbContext.ScheduleRules.AnyAsync(sr => sr.GroupId == groupId);

        return isUsedInRules;
    }
}
