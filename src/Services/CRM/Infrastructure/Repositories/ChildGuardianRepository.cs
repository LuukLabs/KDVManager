using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.CRM.Infrastructure.Repositories;

public class ChildGuardianRepository : BaseRepository<ChildGuardian>, IChildGuardianRepository
{
    public ChildGuardianRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<List<ChildGuardian>> GetByChildIdAsync(Guid childId)
    {
        return await _dbContext.Set<ChildGuardian>()
            .Where(cg => cg.ChildId == childId)
            .OrderBy(cg => cg.IsPrimaryContact ? 0 : 1)
            .ToListAsync();
    }

    public async Task<List<ChildGuardian>> GetByGuardianIdAsync(Guid guardianId)
    {
        return await _dbContext.Set<ChildGuardian>()
            .Where(cg => cg.GuardianId == guardianId)
            .ToListAsync();
    }

    public async Task<ChildGuardian?> GetRelationshipAsync(Guid childId, Guid guardianId)
    {
        return await _dbContext.Set<ChildGuardian>()
            .FirstOrDefaultAsync(cg => cg.ChildId == childId && cg.GuardianId == guardianId);
    }

    public async Task<bool> RelationshipExistsAsync(Guid childId, Guid guardianId)
    {
        return await _dbContext.Set<ChildGuardian>()
            .AnyAsync(cg => cg.ChildId == childId && cg.GuardianId == guardianId);
    }

    public async Task<bool> IsGuardianLinkedAsync(Guid guardianId)
    {
        return await _dbContext.Set<ChildGuardian>()
            .AnyAsync(cg => cg.GuardianId == guardianId);
    }

    public async Task RemovePrimaryContactForChildAsync(Guid childId)
    {
        var existingPrimaryGuardians = await _dbContext.Set<ChildGuardian>()
            .Where(cg => cg.ChildId == childId && cg.IsPrimaryContact)
            .ToListAsync();

        foreach (var guardian in existingPrimaryGuardians)
        {
            guardian.IsPrimaryContact = false;
        }
    }
}
