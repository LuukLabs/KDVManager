using System;

namespace KDVManager.Services.Scheduling.Domain.Workflow;

public interface IRuleEvaluationContext
{
    Guid TenantId { get; }
    DateOnly Today { get; }
}
