using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Services.CRM.Domain.Interfaces;

namespace KDVManager.Services.CRM.Application.Contracts.Persistence;

public interface IAdministratorRepository : IAsyncRepository<Administrator>
{
    Task<IReadOnlyList<Administrator>> PagedAsync(IPaginationFilter paginationFilter, string? search = null);
    Task<int> CountAsync(string? search = null);
    Task<bool> ExistsByEmailAsync(string email);
}
