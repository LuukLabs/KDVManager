using System.Text.Json.Serialization;

namespace KDVManager.Shared.Contracts.Enums;

/// <summary>
/// Represents the scheduling status of a child based on their activity intervals.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<ChildSchedulingStatus>))]
public enum ChildSchedulingStatus
{
  /// <summary>
  /// Child has no scheduled activity intervals.
  /// </summary>
  NoPlanning = 0,

  /// <summary>
  /// Child has intervals, but all have ended (all EndDates are in the past).
  /// </summary>
  Past = 1,

  /// <summary>
  /// Child has an interval that includes today (StartDate &lt;= today &lt;= EndDate or EndDate is null).
  /// </summary>
  Active = 2,

  /// <summary>
  /// Child has intervals starting in the future, but none currently active.
  /// </summary>
  Upcoming = 3
}
