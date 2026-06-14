using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.TenantManagement.Domain.Entities;

namespace KDVManager.Services.TenantManagement.Application.Contracts.Persistence;

public interface ITenantRepository
{
    Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(Tenant tenant, CancellationToken cancellationToken = default);
}
