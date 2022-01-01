using System;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Persistence.Repositories
{
    public class GroupRepository : BaseRepository<Group>, IGroupRepository
    {
        public GroupRepository(SchedulingDbContext dbContext) : base(dbContext)
        {
        }

        public Task<bool> IsNameUnique(string name)
        {
            var matches = _dbContext.Groups.Any(group => group.Name.Equals(name));
            return Task.FromResult(matches);
        }
    }
}
