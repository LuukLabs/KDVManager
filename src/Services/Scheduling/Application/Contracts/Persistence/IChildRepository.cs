using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface IChildRepository : IAsyncRepository<Child>
{
    public Task<List<Child>> GetChildrenByIdsAsync(List<Guid> childIds);
}
