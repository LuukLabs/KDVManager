using System;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.GroupManagement.Application.Contracts.Persistence;
using KDVManager.Services.GroupManagement.Domain.Entities;

namespace KDVManager.Services.GroupManagement.Persistence.Repositories
{
    public class GroupRepository : BaseRepository<Group>, IGroupRepository
    {
        public GroupRepository(GroupManagementDbContext dbContext) : base(dbContext)
        {
        }

        public Task<bool> IsNameUnique(string name)
        {
            var matches = _dbContext.Groups.Any(group => group.Name.Equals(name));
            return Task.FromResult(matches);
        }
    }
}
