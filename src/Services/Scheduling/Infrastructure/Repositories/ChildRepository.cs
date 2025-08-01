﻿using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public class ChildRepository : BaseRepository<Child>, IChildRepository
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
