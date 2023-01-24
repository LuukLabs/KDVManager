using System;
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
    public ChildRepository(CRMDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<IReadOnlyList<Child>> PagedAsync(IPaginationFilter paginationFilter)
    {
        int skip = (paginationFilter.PageNumber - 1) * paginationFilter.PageSize;

        return await _dbContext.Set<Child>()
        .OrderBy(child => child.GivenName).ThenBy(child => child.FamilyName)
        .Skip((paginationFilter.PageNumber - 1) * paginationFilter.PageSize).Take(paginationFilter.PageSize)
        .ToListAsync();
    }

    public async Task<int> CountAsync()
    {
        return await _dbContext.Set<Child>().CountAsync();
    }
}
