using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.TenantManagement.Application.Contracts.Persistence;
using KDVManager.Services.TenantManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.TenantManagement.Infrastructure.Repositories;

public class TenantRepository : ITenantRepository
{
    private readonly ApplicationDbContext _dbContext;

    public TenantRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbContext.Tenants.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task AddAsync(Tenant tenant, CancellationToken cancellationToken = default)
    {
        _dbContext.Tenants.Add(tenant);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
