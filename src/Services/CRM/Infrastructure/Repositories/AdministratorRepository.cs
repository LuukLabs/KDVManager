using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Services.CRM.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.CRM.Infrastructure.Repositories;

public class AdministratorRepository : BaseRepository<Administrator>, IAdministratorRepository
{
    public AdministratorRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<IReadOnlyList<Administrator>> PagedAsync(IPaginationFilter paginationFilter, string? search = null)
    {
        IQueryable<Administrator> administrators = _dbContext.Set<Administrator>().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%".ToLower();
            administrators = administrators.Where(administrator =>
                EF.Functions.Like(administrator.Name.ToLower(), pattern) ||
                EF.Functions.Like(administrator.Email.ToLower(), pattern)
            );
        }

        administrators = administrators.OrderBy(administrator => administrator.Name);
        administrators = administrators.Skip((paginationFilter.PageNumber - 1) * paginationFilter.PageSize).Take(paginationFilter.PageSize);

        return await administrators.ToListAsync();
    }

    public async Task<int> CountAsync(string? search = null)
    {
        IQueryable<Administrator> administrators = _dbContext.Set<Administrator>().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%".ToLower();
            administrators = administrators.Where(administrator =>
                EF.Functions.Like(administrator.Name.ToLower(), pattern) ||
                EF.Functions.Like(administrator.Email.ToLower(), pattern)
            );
        }

        return await administrators.CountAsync();
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        var normalized = email.Trim().ToLower();
        return await _dbContext.Set<Administrator>().AnyAsync(administrator => administrator.Email.ToLower() == normalized);
    }
}
