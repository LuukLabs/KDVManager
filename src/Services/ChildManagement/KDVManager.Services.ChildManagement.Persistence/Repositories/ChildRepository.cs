using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.ChildManagement.Application.Contracts.Persistence;
using KDVManager.Services.ChildManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.ChildManagement.Persistence.Repositories
{
    public class ChildRepository : BaseRepository<Child>, IChildRepository
    {
        public ChildRepository(ChildManagementDbContext dbContext) : base(dbContext)
        {
        }

        public new async Task<IReadOnlyList<Child>> ListAllAsync()
        {
            return await _dbContext.Set<Child>().OrderBy(child => child.GivenName).ThenBy(child => child.FamilyName).ToListAsync();
        }

        public async Task<IReadOnlyList<Child>> GetPagedChildren(int page, int size)
        {
            return await _dbContext.Set<Child>().Skip((page - 1) * size).Take(size).AsNoTracking().ToListAsync();
        }
    }
}
