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
    public ChildRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<IReadOnlyList<Child>> PagedAsync(IPaginationFilter paginationFilter, string? search)
    {
        int skip = (paginationFilter.PageNumber - 1) * paginationFilter.PageSize;

        IQueryable<Child> children = _dbContext.Set<Child>().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%".ToLower();
            // Avoid string concatenation translation issues; match either given name, family name, or both with space in between.
            children = children.Where(child =>
                EF.Functions.Like((child.GivenName ?? "").ToLower(), pattern) ||
                EF.Functions.Like((child.FamilyName ?? "").ToLower(), pattern) ||
                EF.Functions.Like(((child.GivenName ?? "") + " " + (child.FamilyName ?? "")).ToLower(), pattern)
            );
        }

        children = children.OrderBy(child => child.GivenName).ThenBy(child => child.FamilyName);
        children = children.Skip((paginationFilter.PageNumber - 1) * paginationFilter.PageSize).Take(paginationFilter.PageSize);

        return await children.ToListAsync();
    }

    public async Task<int> CountAsync(string? search = null)
    {
        IQueryable<Child> children = _dbContext.Set<Child>().AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%".ToLower();
            children = children.Where(child =>
                EF.Functions.Like((child.GivenName ?? "").ToLower(), pattern) ||
                EF.Functions.Like((child.FamilyName ?? "").ToLower(), pattern) ||
                EF.Functions.Like(((child.GivenName ?? "") + " " + (child.FamilyName ?? "")).ToLower(), pattern)
            );
        }
        return await children.CountAsync();
    }

    public async Task<IReadOnlyList<Child>> PagedWithIntervalsAsync(IPaginationFilter paginationFilter, string? search)
    {
        IQueryable<Child> children = _dbContext.Set<Child>()
            .Include(c => c.ActivityIntervals)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%".ToLower();
            children = children.Where(child =>
                EF.Functions.Like((child.GivenName ?? "").ToLower(), pattern) ||
                EF.Functions.Like((child.FamilyName ?? "").ToLower(), pattern) ||
                EF.Functions.Like(((child.GivenName ?? "") + " " + (child.FamilyName ?? "")).ToLower(), pattern)
            );
        }

        children = children.OrderBy(child => child.GivenName).ThenBy(child => child.FamilyName);
        children = children.Skip((paginationFilter.PageNumber - 1) * paginationFilter.PageSize).Take(paginationFilter.PageSize);

        return await children.ToListAsync();
    }

    public async Task<Child?> GetByIdWithIntervalsAsync(Guid id)
    {
        return await _dbContext.Set<Child>()
            .Include(c => c.ActivityIntervals)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IReadOnlyList<Child>> GetActiveChildrenInPeriodAsync(DateOnly startDate, DateOnly endDate)
    {
        // A child is active in a period if any of their activity intervals overlap with the period.
        // Overlap occurs when: interval.StartDate <= endDate AND (interval.EndDate >= startDate OR interval.EndDate is null)
        return await _dbContext.Set<Child>()
            .Include(c => c.ActivityIntervals)
            .Where(c => c.ActivityIntervals.Any(i =>
                i.StartDate <= endDate &&
                (!i.EndDate.HasValue || i.EndDate >= startDate)))
            .ToListAsync();
    }
}
