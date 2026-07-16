using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.TenantManagement.Domain.Entities;

namespace KDVManager.Services.TenantManagement.Application.Contracts.Persistence;

public interface IMembershipRepository
{
    /// <summary>Returns the membership for the given identity provider subject, or null.</summary>
    Task<Membership?> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);

    Task AddAsync(Membership membership, CancellationToken cancellationToken = default);

    /// <summary>Removes all memberships of the tenant; used when the tenant is deleted.</summary>
    Task DeleteByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
}
