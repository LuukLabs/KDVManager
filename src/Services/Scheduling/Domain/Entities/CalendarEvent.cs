using System;
using KDVManager.Services.Scheduling.Domain.Interfaces;

namespace KDVManager.Services.Scheduling.Domain.Entities;

/// <summary>
/// Domain representation of a flattened calendar event. Based on underlying schedule rules, absences, closures, etc.
/// Stored transiently (not persisted yet) but part of domain so application layer returns domain types.
/// </summary>
public sealed class CalendarEvent
{
    public Guid Id { get; init; }
    public Guid? GroupId { get; init; }
    public Guid? ChildId { get; init; }
    public CalendarEventType Type { get; init; }
    public DateTime Start { get; init; }
    public DateTime End { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }

    public CalendarEvent WithType(CalendarEventType newType) => new CalendarEvent
    {
        Id = Id,
        GroupId = GroupId,
        ChildId = ChildId,
        Type = newType,
        Start = Start,
        End = End,
        Title = Title,
        Description = Description
    };
}

public enum CalendarEventType
{
    ScheduleRule = 0,
    Absence = 1,
    Closure = 2,
    Actual = 3
}
