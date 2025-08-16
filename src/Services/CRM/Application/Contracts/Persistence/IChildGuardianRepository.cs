using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Services.CRM.Domain.Interfaces;

namespace KDVManager.Services.CRM.Application.Contracts.Persistence;

public interface IChildGuardianRepository : IAsyncRepository<ChildGuardian>
{
    Task<List<ChildGuardian>> GetByChildIdAsync(Guid childId);
    Task<List<ChildGuardian>> GetByGuardianIdAsync(Guid guardianId);
    Task<ChildGuardian?> GetRelationshipAsync(Guid childId, Guid guardianId);
    Task<bool> RelationshipExistsAsync(Guid childId, Guid guardianId);
    Task<bool> IsGuardianLinkedAsync(Guid guardianId);
    Task RemovePrimaryContactForChildAsync(Guid childId);
}
