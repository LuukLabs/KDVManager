using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Contracts.Persistence;

public interface ITenantRepository
{
    Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Creates or updates the local trial read model for the tenant.</summary>
    Task UpsertTrialAsync(Guid id, DateTime trialStartDate, CancellationToken cancellationToken = default);
}
