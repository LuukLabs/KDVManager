using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public class TenantRepository : ITenantRepository
{
    private readonly ApplicationDbContext _dbContext;

    public TenantRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Tenants.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task UpsertTrialAsync(Guid id, DateTime trialStartDate, CancellationToken cancellationToken = default)
    {
        // Npgsql requires UTC for "timestamp with time zone"; the value may arrive
        // with a non-UTC Kind after transport deserialization.
        var trialStartUtc = trialStartDate.Kind switch
        {
            DateTimeKind.Utc => trialStartDate,
            DateTimeKind.Local => trialStartDate.ToUniversalTime(),
            _ => DateTime.SpecifyKind(trialStartDate, DateTimeKind.Utc),
        };

        var tenant = await _dbContext.Tenants.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        if (tenant is null)
        {
            _dbContext.Tenants.Add(new Tenant { Id = id, TrialStartDate = trialStartUtc });
        }
        else
        {
            tenant.TrialStartDate = trialStartUtc;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
