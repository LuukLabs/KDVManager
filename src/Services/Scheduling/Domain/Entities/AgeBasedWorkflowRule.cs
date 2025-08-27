using System;
using KDVManager.Services.Scheduling.Domain.Interfaces;

namespace KDVManager.Services.Scheduling.Domain.Entities;

public enum WorkflowActionType
{
    AddEndMark = 1,
    ReassignGroup = 2
}

public class AgeBasedWorkflowRule : IMustHaveTenant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public bool Enabled { get; set; } = true;
    public int Age { get; set; } // Age in whole years at which rule triggers
    public WorkflowActionType ActionType { get; set; }
    public Guid? TargetGroupId { get; set; } // For ReassignGroup
    public string? EndMarkReason { get; set; } // For AddEndMark
    public int Priority { get; set; } = 100; // Lower executes first when multiple
}
