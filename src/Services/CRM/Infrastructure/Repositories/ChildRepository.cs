﻿using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Services.CRM.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.CRM.Infrastructure.Repositories;

public class ChildRepository : BaseRepository<Child>, IChildRepository
{
    public ChildRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<IReadOnlyList<Child>> PagedAsync(IPaginationFilter paginationFilter, string search, bool archived)
    {
        int skip = (paginationFilter.PageNumber - 1) * paginationFilter.PageSize;

        IQueryable<Child> children = _dbContext.Set<Child>().AsQueryable();

        if (!String.IsNullOrEmpty(search))
        {
            children = children.Where(child => (child.GivenName + child.FamilyName).Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        // Filter by archived status
        if (!archived)
        {
            children = children.Where(child => child.ArchivedAt == null);
        }
        // If archived == true, include all (archived and non-archived)

        children = children.OrderBy(child => child.GivenName).ThenBy(child => child.FamilyName);
        children = children.Skip((paginationFilter.PageNumber - 1) * paginationFilter.PageSize).Take(paginationFilter.PageSize);

        return await children.ToListAsync();
    }

    public async Task<int> CountAsync(bool archived)
    {
        IQueryable<Child> children = _dbContext.Set<Child>().AsQueryable();
        if (!archived)
        {
            children = children.Where(child => child.ArchivedAt == null);
        }
        // If archived == true, include all
        return await children.CountAsync();
    }
}
