using System;

namespace KDVManager.Services.Scheduling.Application.Services.Models;

/// <summary>
/// Generic flattened calendar style event that can represent schedule rules (expanded to concrete dates),
/// absences, closure periods, and actual schedule entries in the future.
/// This model is intentionally generic so it can back multiple UI features and potential iCal feeds.
/// </summary>
public sealed class CalendarEventDto
{
    /// <summary>
    /// Stable identifier of the underlying source entity (or synthetic for expanded rule instances).
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// The group this event belongs to (if applicable). Null for global closure periods.
    /// </summary>
    public Guid? GroupId { get; init; }

    /// <summary>
    /// The child this event is for (when child-specific e.g. schedule / absence).
    /// </summary>
    public Guid? ChildId { get; init; }

    /// <summary>
    /// Type discriminator for consumer logic / styling.
    /// </summary>
    public CalendarEventType Type { get; init; }

    /// <summary>
    /// Start timestamp (UTC) of the event instance.
    /// </summary>
    public DateTime Start { get; init; }

    /// <summary>
    /// End timestamp (UTC) of the event instance.
    /// </summary>
    public DateTime End { get; init; }

    /// <summary>
    /// Short human readable title.
    /// </summary>
    public string Title { get; init; } = string.Empty;

    /// <summary>
    /// Optional longer description / reason text.
    /// </summary>
    public string? Description { get; init; }
}

public enum CalendarEventType
{
    Schedule = 0,
    ScheduleRule = 1,
    Absence = 2,
    Closure = 3,
    Actual = 4 // placeholder for future real-time/actual attendance entries
}
