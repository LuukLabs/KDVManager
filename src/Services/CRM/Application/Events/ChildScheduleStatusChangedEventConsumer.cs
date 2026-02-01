using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Shared.Contracts.Events;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.CRM.Application.Events;

/// <summary>
/// Consumes ChildScheduleStatusChangedEvent from the Scheduling service
/// and updates the child's active status in the CRM database.
/// </summary>
public class ChildScheduleStatusChangedEventConsumer : IConsumer<ChildScheduleStatusChangedEvent>
{
    private readonly IChildRepository _childRepository;
    private readonly ILogger<ChildScheduleStatusChangedEventConsumer> _logger;

    public ChildScheduleStatusChangedEventConsumer(
        IChildRepository childRepository,
        ILogger<ChildScheduleStatusChangedEventConsumer> logger)
    {
        _childRepository = childRepository;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ChildScheduleStatusChangedEvent> context)
    {
        var evt = context.Message;

        _logger.LogInformation(
            "Processing schedule status change for child {ChildId}: IsActive={IsActive}",
            evt.ChildId, evt.IsActive);

        var child = await _childRepository.GetByIdAsync(evt.ChildId);
        if (child == null)
        {
            _logger.LogWarning("Child {ChildId} not found in CRM database", evt.ChildId);
            return;
        }

        // Only update if status actually changed (idempotent)
        if (child.IsActive != evt.IsActive || child.LastActiveDate != evt.LastActiveDate)
        {
            child.IsActive = evt.IsActive;
            child.LastActiveDate = evt.LastActiveDate;

            await _childRepository.UpdateAsync(child);

            _logger.LogInformation(
                "Updated child {ChildId} active status to {IsActive}, LastActiveDate to {LastActiveDate}",
                evt.ChildId, evt.IsActive, evt.LastActiveDate);
        }
        else
        {
            _logger.LogDebug(
                "Child {ChildId} status unchanged (IsActive={IsActive})",
                evt.ChildId, evt.IsActive);
        }
    }
}
