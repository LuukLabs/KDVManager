using System;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Shared.Events;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.Scheduling.Application.Events;

public class ChildCreatedEventConsumer : IConsumer<ChildCreatedEvent>
{
    private readonly ILogger<ChildCreatedEventConsumer> _logger;

    public ChildCreatedEventConsumer(ILogger<ChildCreatedEventConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ChildCreatedEvent> context)
    {
        var childEvent = context.Message;

        _logger.LogInformation("Processing ChildCreatedEvent for ChildId: {ChildId}", childEvent.ChildId);




        // For new children, we don't need to create schedules automatically
        // The scheduling system will handle schedule creation separately
        _logger.LogInformation("Child {ChildId} created, ready for scheduling", childEvent.ChildId);
    }
}
