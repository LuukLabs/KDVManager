using System;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.ChildManagement.Application.Contracts.Persistence;
using KDVManager.Services.ChildManagement.Domain.Entities;

namespace KDVManager.Services.ChildManagement.Persistence.Repositories
{
    public class ChildRepository : BaseRepository<Child>, IChildRepository
    {
        public ChildRepository(ChildManagementDbContext dbContext) : base(dbContext)
        {
        }
    }
}
