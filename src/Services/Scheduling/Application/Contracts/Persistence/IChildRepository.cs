using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface IChildRepository : IAsyncRepository<Child>
{

}
