using System;
using System.Threading.Tasks;
using KDVManager.Services.GroupManagement.Domain.Entities;

namespace KDVManager.Services.GroupManagement.Application.Contracts.Persistence
{
    public interface IGroupRepository : IAsyncRepository<Group>
    {
        Task<bool> IsNameUnique(string name);
    }
}
