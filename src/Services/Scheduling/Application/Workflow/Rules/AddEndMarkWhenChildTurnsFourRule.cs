using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Services;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Domain.Events;
using KDVManager.Services.Scheduling.Domain.Workflow;

namespace KDVManager.Services.Scheduling.Application.Workflow.Rules;

/// <summary>
/// Ensures an EndMark is present on (or kept in sync with) the date a child turns 4.
/// If an existing EndMark for that child & date exists, it's left as-is. Otherwise one is created with a system reason.
/// </summary>
public sealed class AddEndMarkWhenChildTurnsFourRule : IWorkflowRule<ChildTurnedAgeDomainEvent>
{
    private readonly IEndMarkRepository _endMarks;
    private readonly IScheduleTimelineService _timeline;
    private const int TargetAge = 4;
    private const string SystemReason = "Auto: Child turned 4";

    public AddEndMarkWhenChildTurnsFourRule(IEndMarkRepository endMarks, IScheduleTimelineService timeline)
    {
        _endMarks = endMarks;
        _timeline = timeline;
    }

    public async ValueTask EvaluateAsync(ChildTurnedAgeDomainEvent @event, IRuleEvaluationContext context, CancellationToken cancellationToken = default)
    {
        if (@event.Age != TargetAge)
            return;

        var existing = await _endMarks.GetByChildIdAsync(@event.ChildId);
        foreach (var mark in existing)
        {
            if (mark.EndDate == @event.BirthdayDate)
            {
                // Already have a mark for this date; nothing to do.
                return;
            }
        }

        // Create a new EndMark at birthday date.
        var newMark = new EndMark(@event.ChildId, @event.BirthdayDate, SystemReason);
        await _endMarks.AddAsync(newMark);
        await _timeline.RecalculateAsync(@event.ChildId);
    }
}
