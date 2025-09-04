using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Contracts.Services;

/// <summary>
/// Service responsible for maintaining system-generated EndMarks for children based on configuration rules
/// </summary>
public interface IEndMarkAutomationService
{
    /// <summary>
    /// Maintains the EndMark for a given child by creating, updating, or deleting system-generated EndMarks
    /// based on the child's birth date and automation configuration
    /// </summary>
    /// <param name="child">The child for which to maintain EndMarks</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task representing the async operation</returns>
    Task MaintainEndMarkAsync(Child child, CancellationToken cancellationToken = default);
}
