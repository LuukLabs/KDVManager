using System;
using System.Collections.Generic;

namespace KDVManager.Shared.Contracts.Events;

/// <summary>
/// Represents a single activity interval for a child.
/// </summary>
public class ActivityInterval
{
  /// <summary>
  /// The start date of this activity interval (inclusive).
  /// </summary>
  public DateOnly StartDate { get; set; }

  /// <summary>
  /// The end date of this activity interval (inclusive).
  /// Null indicates an open-ended interval with no defined end.
  /// </summary>
  public DateOnly? EndDate { get; set; }
}

/// <summary>
/// Event raised when a child's activity intervals change.
/// Activity intervals represent periods when a child has scheduled attendance.
/// These intervals are derived from schedules and endmarks in the Scheduling service.
/// Tenant information is passed via message headers.
/// </summary>
public class ChildActivityIntervalsChangedEvent
{
  /// <summary>
  /// The unique identifier of the child whose intervals changed.
  /// </summary>
  public Guid ChildId { get; set; }

  /// <summary>
  /// The complete list of activity intervals for this child.
  /// The consumer should replace all existing intervals with this list.
  /// An empty list indicates the child has no scheduled activity.
  /// </summary>
  public List<ActivityInterval> Intervals { get; set; } = [];
}
