using System;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Shared.Contracts.Events;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.CRM.Application.Events;

/// <summary>
/// Consumes ChildActivityIntervalsChangedEvent from the Scheduling service
/// and updates the child's activity intervals in the CRM database.
/// </summary>
public class ChildActivityIntervalsChangedEventConsumer : IConsumer<ChildActivityIntervalsChangedEvent>
{
  private readonly IChildRepository _childRepository;
  private readonly IChildActivityIntervalRepository _intervalRepository;
  private readonly ILogger<ChildActivityIntervalsChangedEventConsumer> _logger;

  public ChildActivityIntervalsChangedEventConsumer(
      IChildRepository childRepository,
      IChildActivityIntervalRepository intervalRepository,
      ILogger<ChildActivityIntervalsChangedEventConsumer> logger)
  {
    _childRepository = childRepository;
    _intervalRepository = intervalRepository;
    _logger = logger;
  }

  public async Task Consume(ConsumeContext<ChildActivityIntervalsChangedEvent> context)
  {
    var evt = context.Message;

    _logger.LogInformation(
        "Processing activity intervals change for child {ChildId}: {IntervalCount} intervals",
        evt.ChildId, evt.Intervals.Count);

    var child = await _childRepository.GetByIdAsync(evt.ChildId);
    if (child == null)
    {
      _logger.LogWarning("Child {ChildId} not found in CRM database", evt.ChildId);
      return;
    }

    // Delete existing intervals for this child
    await _intervalRepository.DeleteByChildIdAsync(evt.ChildId);

    // Create new intervals
    var intervals = evt.Intervals.Select(i => new ChildActivityInterval
    {
      Id = Guid.NewGuid(),
      ChildId = evt.ChildId,
      StartDate = i.StartDate,
      EndDate = i.EndDate
    }).ToList();

    if (intervals.Count > 0)
    {
      await _intervalRepository.AddRangeAsync(intervals);
    }

    _logger.LogInformation(
        "Updated child {ChildId} with {IntervalCount} activity intervals",
        evt.ChildId, intervals.Count);
  }
}
