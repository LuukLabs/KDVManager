using System;
using System.Threading.Tasks;
using KDVManager.Services.Shared.Events;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.Scheduling.Application.Events;

public class ChildUpdatedEventConsumer : IConsumer<ChildUpdatedEvent>
{
    private readonly ILogger<ChildUpdatedEventConsumer> _logger;

    public ChildUpdatedEventConsumer(ILogger<ChildUpdatedEventConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ChildUpdatedEvent> context)
    {
        var childEvent = context.Message;

        _logger.LogInformation("Processing ChildUpdatedEvent for ChildId: {ChildId}", childEvent.ChildId);

        if (childEvent.DateOfBirth.HasValue)
        {
            var age = DateTime.Now.Year - childEvent.DateOfBirth.Value.Year;
            if (DateTime.Now.DayOfYear < childEvent.DateOfBirth.Value.DayOfYear)
                age--;

            _logger.LogInformation("Child {ChildId} age updated to {Age} years", childEvent.ChildId, age);

            if (age > 5)
            {
                _logger.LogInformation("Child {ChildId} is older than 5 years, consider archiving schedules", childEvent.ChildId);
            }
        }
    }
}