using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Services.CRM.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.CRM.Infrastructure.Repositories;

public class GuardianRepository : BaseRepository<Guardian>, IGuardianRepository
{
    public GuardianRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<IReadOnlyList<Guardian>> PagedAsync(IPaginationFilter paginationFilter, string? search = null)
    {
        var query = _dbContext.Set<Guardian>().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var terms = search.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (terms.Length == 1)
            {
                var searchTerm = $"%{terms[0]}%";
                query = query.Where(p =>
                    EF.Functions.ILike(p.GivenName, searchTerm) ||
                    EF.Functions.ILike(p.FamilyName, searchTerm));
            }
            else if (terms.Length >= 2)
            {
                var first = $"%{terms[0]}%";
                var second = $"%{terms[1]}%";
                // Match: Firstname Lastname OR Lastname Firstname (order-insensitive)
                query = query.Where(p =>
                    (EF.Functions.ILike(p.GivenName, first) && EF.Functions.ILike(p.FamilyName, second)) ||
                    (EF.Functions.ILike(p.GivenName, second) && EF.Functions.ILike(p.FamilyName, first))
                );
                // If more than 2 terms, also match any additional terms in either field
                for (int i = 2; i < terms.Length; i++)
                {
                    var extra = $"%{terms[i]}%";
                    query = query.Where(p =>
                        EF.Functions.ILike(p.GivenName, extra) ||
                        EF.Functions.ILike(p.FamilyName, extra));
                }
            }
        }

        return await query
            .OrderBy(person => person.GivenName)
            .ThenBy(person => person.FamilyName)
            .Skip((paginationFilter.PageNumber - 1) * paginationFilter.PageSize)
            .Take(paginationFilter.PageSize)
            .ToListAsync();
    }

    public async Task<int> CountAsync(string? search = null)
    {
        var query = _dbContext.Set<Guardian>().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(p =>
                p.GivenName.Contains(search) ||
                p.FamilyName.Contains(search));
        }

        return await query.CountAsync();
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
