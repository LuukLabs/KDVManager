using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface IAgeBasedWorkflowRuleRepository : IAsyncRepository<AgeBasedWorkflowRule>
{
    Task<IReadOnlyList<AgeBasedWorkflowRule>> GetByTenantAsync(Guid tenantId);
    Task<IReadOnlyList<AgeBasedWorkflowRule>> GetByTenantAndAgeAsync(Guid tenantId, int age);
}
