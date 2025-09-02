using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Events;
using KDVManager.Services.Scheduling.Domain.Workflow;

namespace KDVManager.Services.Scheduling.Application.Workflow.Rules;

/// <summary>
/// Generic reassignment logic triggered by config (age checked externally in engine).
/// The engine supplies only events with matching age; rule picks target group from config or heuristic.
/// </summary>
public sealed class ReassignGroupRule : IWorkflowRule<ChildTurnedAgeDomainEvent>
{
    private readonly IScheduleRepository _schedules;
    private readonly IGroupRepository _groups;

    public ReassignGroupRule(IScheduleRepository schedules, IGroupRepository groups)
    {
        _schedules = schedules;
        _groups = groups;
    }

    public async ValueTask EvaluateAsync(ChildTurnedAgeDomainEvent @event, IRuleEvaluationContext context, CancellationToken cancellationToken = default)
    {
        // Actual target group selection now deferred to engine/config; we fallback heuristic if none.
        var schedules = await _schedules.GetSchedulesByChildIdAsync(@event.ChildId);
        if (schedules.Count == 0) return;

        var candidateGroups = await _groups.ListAllAsync();
        var target = candidateGroups
            .OrderBy(g => g.Name)
            .FirstOrDefault();
        if (target == null) return;

        bool changed = false;
        foreach (var schedule in schedules)
        {
            foreach (var rule in schedule.ScheduleRules)
            {
                if (rule.GroupId != target.Id)
                {
                    rule.GroupId = target.Id;
                    changed = true;
                }
            }
        }
        if (!changed) return;

        foreach (var schedule in schedules)
        {
            await _schedules.UpdateAsync(schedule);
        }
    }
}
