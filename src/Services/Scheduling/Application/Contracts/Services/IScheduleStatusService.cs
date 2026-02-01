using System.Threading;
using System.Threading.Tasks;

namespace KDVManager.Services.Scheduling.Application.Contracts.Services;

/// <summary>
/// Service responsible for computing and publishing child schedule active status changes.
/// </summary>
public interface IScheduleStatusService
{
    /// <summary>
    /// Evaluates all children and publishes ChildScheduleStatusChangedEvent for each.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The number of children processed</returns>
    Task<int> SyncAllChildrenStatusAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Evaluates a single child's schedule status and publishes an event if needed.
    /// </summary>
    /// <param name="childId">The ID of the child to evaluate</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task PublishStatusForChildAsync(System.Guid childId, CancellationToken cancellationToken = default);
}
