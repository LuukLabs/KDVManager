using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Shared.Contracts.Tenancy;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public class EndMarkSettingsRepository : BaseRepository<EndMarkSettings>, IEndMarkSettingsRepository
{
    private readonly ITenancyContextAccessor _tenancyContextAccessor;

    public EndMarkSettingsRepository(ApplicationDbContext dbContext, ITenancyContextAccessor tenancyContextAccessor)
        : base(dbContext)
    {
        _tenancyContextAccessor = tenancyContextAccessor;
    }

    public async Task<EndMarkSettings?> GetByTenantAsync()
    {
        var tenantId = _tenancyContextAccessor.Current!.TenantId;
        return await _dbContext.EndMarkSettings
            .FirstOrDefaultAsync(ems => ems.TenantId == tenantId);
    }

    public async Task<EndMarkSettings> GetOrCreateDefaultAsync()
    {
        var existing = await GetByTenantAsync();
        if (existing != null)
        {
            return existing;
        }

        // Create default settings for this tenant
        var defaultSettings = EndMarkSettings.CreateDefault();
        await AddAsync(defaultSettings);

        return defaultSettings;
    }
}
