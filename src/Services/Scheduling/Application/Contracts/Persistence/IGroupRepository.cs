using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface IGroupRepository : IAsyncRepository<Group>
{
    Task<IReadOnlyList<Group>> PagedAsync(IPaginationFilter paginationFilter);
    Task<int> CountAsync();

    Task<bool> IsGroupNameUnique(string name);
    Task<IReadOnlyList<Group>> GetGroupsByIdsAsync(List<Guid> ids);
}

