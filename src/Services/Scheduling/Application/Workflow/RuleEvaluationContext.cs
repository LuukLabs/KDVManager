using System;
using KDVManager.Services.Scheduling.Domain.Workflow;

namespace KDVManager.Services.Scheduling.Application.Workflow;

internal sealed class RuleEvaluationContext : IRuleEvaluationContext
{
    public Guid TenantId { get; }
    public DateOnly Today { get; }

    public RuleEvaluationContext(Guid tenantId, DateOnly today)
    {
        TenantId = tenantId;
        Today = today;
    }
}
