using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public class AgeBasedWorkflowRuleRepository : BaseRepository<AgeBasedWorkflowRule>, IAgeBasedWorkflowRuleRepository
{
    public AgeBasedWorkflowRuleRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<IReadOnlyList<AgeBasedWorkflowRule>> GetByTenantAsync(Guid tenantId)
        => await _dbContext.AgeBasedWorkflowRules.Where(r => r.TenantId == tenantId).OrderBy(r => r.Priority).ThenBy(r => r.Age).ToListAsync();

    public async Task<IReadOnlyList<AgeBasedWorkflowRule>> GetByTenantAndAgeAsync(Guid tenantId, int age)
        => await _dbContext.AgeBasedWorkflowRules.Where(r => r.TenantId == tenantId && r.Age == age && r.Enabled)
            .OrderBy(r => r.Priority).ToListAsync();
}
