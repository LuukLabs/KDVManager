using System.Threading;
using System.Threading.Tasks;

namespace KDVManager.Services.Scheduling.Application.Contracts.Services;

/// <summary>
/// Service responsible for computing and publishing child activity intervals.
/// Activity intervals represent periods when a child has scheduled attendance,
/// derived from their schedules and endmarks.
/// </summary>
public interface IScheduleStatusService
{
  /// <summary>
  /// Evaluates all children and publishes ChildActivityIntervalsChangedEvent for each.
  /// </summary>
  /// <param name="cancellationToken">Cancellation token</param>
  /// <returns>The number of children processed</returns>
  Task<int> SyncAllChildrenStatusAsync(CancellationToken cancellationToken = default);

  /// <summary>
  /// Evaluates a single child's activity intervals and publishes an event.
  /// </summary>
  /// <param name="childId">The ID of the child to evaluate</param>
  /// <param name="cancellationToken">Cancellation token</param>
  Task PublishStatusForChildAsync(System.Guid childId, CancellationToken cancellationToken = default);
}
