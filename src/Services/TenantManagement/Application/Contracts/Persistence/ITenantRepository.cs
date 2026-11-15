using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.TenantManagement.Domain.Entities;

namespace KDVManager.Services.TenantManagement.Application.Contracts.Persistence;

public interface ITenantRepository
{
    Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>All tenants, newest first. Platform-admin listing only.</summary>
    Task<IReadOnlyList<Tenant>> ListAllAsync(CancellationToken cancellationToken = default);

    Task AddAsync(Tenant tenant, CancellationToken cancellationToken = default);

    Task UpdateAsync(Tenant tenant, CancellationToken cancellationToken = default);
}
