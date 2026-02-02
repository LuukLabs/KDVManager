using System;
using KDVManager.Services.CRM.Domain.Interfaces;

namespace KDVManager.Services.CRM.Domain.Entities;

/// <summary>
/// Represents a period of activity for a child based on their schedule.
/// An interval spans from the start of a planning period until an endmark or next schedule change.
/// Multiple intervals may exist for a single child if there are gaps in their schedule.
/// </summary>
public class ChildActivityInterval : IMustHaveTenant
{
  public Guid Id { get; set; }

  public Guid TenantId { get; set; }

  public Guid ChildId { get; set; }

  /// <summary>
  /// The start date of this activity interval (inclusive).
  /// </summary>
  public DateOnly StartDate { get; set; }

  /// <summary>
  /// The end date of this activity interval (inclusive).
  /// Null indicates an open-ended interval with no defined end.
  /// </summary>
  public DateOnly? EndDate { get; set; }

  // Navigation property
  public Child? Child { get; set; }
}
