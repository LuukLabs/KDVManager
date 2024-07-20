using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Services.CRM.Domain.Interfaces;

namespace KDVManager.Services.CRM.Application.Contracts.Persistence;

public interface IPersonRepository : IAsyncRepository<Person>
{
    Task<IReadOnlyList<Person>> PagedAsync(IPaginationFilter paginationFilter);
    Task<int> CountAsync();
}

