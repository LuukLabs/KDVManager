using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Tenants.Application.Contracts.Persistence;
using KDVManager.Services.Tenants.Domain.Entities;
using KDVManager.Services.Tenants.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Tenants.Infrastructure.Repositories;

public class TenantRepository : BaseRepository<Tenant>, ITenantRepository
{
    public TenantRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<IReadOnlyList<Tenant>> PagedAsync(IPaginationFilter paginationFilter, string? search = null)
    {
        IQueryable<Tenant> tenants = _dbContext.Set<Tenant>().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%".ToLower();
            tenants = tenants.Where(tenant => EF.Functions.Like(tenant.Name.ToLower(), pattern));
        }

        tenants = tenants.OrderBy(tenant => tenant.Name);
        tenants = tenants.Skip((paginationFilter.PageNumber - 1) * paginationFilter.PageSize).Take(paginationFilter.PageSize);

        return await tenants.ToListAsync();
    }

    public async Task<int> CountAsync(string? search = null)
    {
        IQueryable<Tenant> tenants = _dbContext.Set<Tenant>().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%".ToLower();
            tenants = tenants.Where(tenant => EF.Functions.Like(tenant.Name.ToLower(), pattern));
        }

        return await tenants.CountAsync();
    }

    public async Task<bool> NameExistsAsync(string name, Guid? excludeId = null)
    {
        var normalized = name.Trim().ToLower();
        return await _dbContext.Set<Tenant>()
            .Where(tenant => !excludeId.HasValue || tenant.Id != excludeId.Value)
            .AnyAsync(tenant => tenant.Name.ToLower() == normalized);
    }
}
