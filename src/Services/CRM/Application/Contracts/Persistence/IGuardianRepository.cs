using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Services.CRM.Domain.Interfaces;

namespace KDVManager.Services.CRM.Application.Contracts.Persistence;

public interface IGuardianRepository : IAsyncRepository<Guardian>
{
    Task<IReadOnlyList<Guardian>> PagedAsync(IPaginationFilter paginationFilter, string? search = null);
    Task<int> CountAsync(string? search = null);
    Task<Guardian?> GetByIdWithRelationshipsAsync(Guid id);
    Task<IReadOnlyList<Guardian>> GetAllWithRelationshipsAsync();
}

