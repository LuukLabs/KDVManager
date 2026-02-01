using System;

namespace KDVManager.Shared.Contracts.Events;

/// <summary>
/// Event raised when a child's active schedule status changes.
/// A child is considered active when they have at least one schedule where
/// today's date falls between the StartDate and EndDate (or EndDate is null).
/// Tenant information is passed via message headers.
/// </summary>
public class ChildScheduleStatusChangedEvent
{
    /// <summary>
    /// The unique identifier of the child whose status changed.
    /// </summary>
    public Guid ChildId { get; set; }

    /// <summary>
    /// True if the child currently has an active schedule, false otherwise.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// The end date of the last active schedule, if applicable.
    /// Null if the child has no schedules or the latest schedule is open-ended.
    /// </summary>
    public DateOnly? LastActiveDate { get; set; }
}
