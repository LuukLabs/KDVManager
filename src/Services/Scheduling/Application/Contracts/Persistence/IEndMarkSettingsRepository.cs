using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface IEndMarkSettingsRepository : IAsyncRepository<EndMarkSettings>
{
    /// <summary>
    /// Gets the EndMark settings for the current tenant
    /// </summary>
    Task<EndMarkSettings?> GetByTenantAsync();

    /// <summary>
    /// Gets or creates default EndMark settings for the current tenant
    /// </summary>
    Task<EndMarkSettings> GetOrCreateDefaultAsync();
}
