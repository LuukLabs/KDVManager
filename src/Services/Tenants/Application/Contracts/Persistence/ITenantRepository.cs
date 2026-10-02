using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Tenants.Domain.Entities;
using KDVManager.Services.Tenants.Domain.Interfaces;

namespace KDVManager.Services.Tenants.Application.Contracts.Persistence;

public interface ITenantRepository : IAsyncRepository<Tenant>
{
    Task<IReadOnlyList<Tenant>> PagedAsync(IPaginationFilter paginationFilter, string? search = null);
    Task<int> CountAsync(string? search = null);

    /// <summary>
    /// Whether another tenant already has this name (case-insensitive), excluding excludeId.
    /// </summary>
    Task<bool> NameExistsAsync(string name, System.Guid? excludeId = null);
}
