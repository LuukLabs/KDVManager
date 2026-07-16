using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface ITenantRepository
{
    Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Creates or updates the local trial read model for the tenant.</summary>
    Task UpsertTrialAsync(Guid id, DateTime trialStartDate, bool isSubscribed, CancellationToken cancellationToken = default);

    /// <summary>Removes the local tenant read model row, if present.</summary>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
