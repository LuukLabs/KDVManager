using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence
{
    public interface IGroupRepository : IAsyncRepository<Group>
    {
        Task<bool> IsNameUnique(string name);
    }
}
