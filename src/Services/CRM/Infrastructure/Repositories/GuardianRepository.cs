using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Services.CRM.Domain.Interfaces;
using KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetGuardianList;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.CRM.Infrastructure.Repositories;

public class GuardianRepository : BaseRepository<Guardian>, IGuardianRepository
{
    public GuardianRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<IReadOnlyList<Guardian>> PagedAsync(IPaginationFilter paginationFilter, string? search = null)
    {
        IQueryable<Guardian> guardians = _dbContext.Set<Guardian>()
            .Include(g => g.PhoneNumbers)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%".ToLower();
            // Match either given name, family name, full name, email, or phone numbers - similar to children search
            guardians = guardians.Where(guardian =>
                EF.Functions.Like((guardian.GivenName ?? "").ToLower(), pattern) ||
                EF.Functions.Like((guardian.FamilyName ?? "").ToLower(), pattern) ||
                EF.Functions.Like(((guardian.GivenName ?? "") + " " + (guardian.FamilyName ?? "")).ToLower(), pattern) ||
                EF.Functions.Like((guardian.Email ?? "").ToLower(), pattern) ||
                guardian.PhoneNumbers.Any(n => EF.Functions.Like((n.Number ?? "").ToLower(), pattern))
            );
        }

        guardians = guardians.OrderBy(guardian => guardian.GivenName).ThenBy(guardian => guardian.FamilyName);
        guardians = guardians.Skip((paginationFilter.PageNumber - 1) * paginationFilter.PageSize).Take(paginationFilter.PageSize);

        return await guardians.ToListAsync();
    }

    public async Task<IReadOnlyList<GuardianWithChildrenCountDTO>> PagedWithChildrenCountAsync(IPaginationFilter paginationFilter, string? search = null)
    {
        var guardiansQuery = _dbContext.Set<Guardian>()
            .Include(g => g.PhoneNumbers)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%".ToLower();
            // Match either given name, family name, full name, email, or phone numbers - similar to children search
            guardiansQuery = guardiansQuery.Where(guardian =>
                EF.Functions.Like((guardian.GivenName ?? "").ToLower(), pattern) ||
                EF.Functions.Like((guardian.FamilyName ?? "").ToLower(), pattern) ||
                EF.Functions.Like(((guardian.GivenName ?? "") + " " + (guardian.FamilyName ?? "")).ToLower(), pattern) ||
                EF.Functions.Like((guardian.Email ?? "").ToLower(), pattern) ||
                guardian.PhoneNumbers.Any(n => EF.Functions.Like((n.Number ?? "").ToLower(), pattern))
            );
        }

        var result = await guardiansQuery
            .OrderBy(guardian => guardian.GivenName)
            .ThenBy(guardian => guardian.FamilyName)
            .Skip((paginationFilter.PageNumber - 1) * paginationFilter.PageSize)
            .Take(paginationFilter.PageSize)
            .Select(g => new GuardianWithChildrenCountDTO
            {
                Guardian = g,
                ChildrenCount = _dbContext.Set<ChildGuardian>().Count(cg => cg.GuardianId == g.Id)
            })
            .ToListAsync();

        return result;
    }

    public async Task<int> CountAsync(string? search = null)
    {
        IQueryable<Guardian> guardians = _dbContext.Set<Guardian>()
            .Include(g => g.PhoneNumbers)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%".ToLower();
            // Use the same search logic as PagedAsync for consistency
            guardians = guardians.Where(guardian =>
                EF.Functions.Like((guardian.GivenName ?? "").ToLower(), pattern) ||
                EF.Functions.Like((guardian.FamilyName ?? "").ToLower(), pattern) ||
                EF.Functions.Like(((guardian.GivenName ?? "") + " " + (guardian.FamilyName ?? "")).ToLower(), pattern) ||
                EF.Functions.Like((guardian.Email ?? "").ToLower(), pattern) ||
                guardian.PhoneNumbers.Any(n => EF.Functions.Like((n.Number ?? "").ToLower(), pattern))
            );
        }

        return await guardians.CountAsync();
    }

    public async Task<Guardian?> GetByIdWithRelationshipsAsync(Guid id)
    {
        // Use split queries to avoid cartesian explosion + EF warning when including multiple collections
        return await _dbContext.Set<Guardian>()
            .Include(p => p.PhoneNumbers)
            .AsSplitQuery()
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IReadOnlyList<Guardian>> GetAllWithRelationshipsAsync()
    {
        return await _dbContext.Set<Guardian>()
            .Include(p => p.PhoneNumbers)
            .AsSplitQuery()
            .OrderBy(p => p.GivenName)
            .ThenBy(p => p.FamilyName)
            .ToListAsync();
    }
}
