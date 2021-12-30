using System;
using System.Threading.Tasks;
using KDVManager.Services.ChildManagement.Domain.Entities;

namespace KDVManager.Services.ChildManagement.Application.Contracts.Persistence
{
    public interface IChildRepository : IAsyncRepository<Child>
    {
        
    }
}
