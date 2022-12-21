using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Infrastructure;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Domain.Interfaces;

namespace KDVManager.Services.Scheduling.Application.Contracts.Infrastructure;

public interface IGroupRepository : IAsyncRepository<Group>
{
    Task<IReadOnlyList<Group>> PagedAsync(IPaginationFilter paginationFilter);
    Task<int> CountAsync();
}

