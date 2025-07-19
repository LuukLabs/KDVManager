using System;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Features.Children.Commands.AddChild;
using KDVManager.Shared.Contracts.Events;

using MassTransit;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.Scheduling.Application.Events;

public class ChildDeletedEventConsumer : IConsumer<ChildDeletedEvent>
{
    private readonly ILogger<ChildDeletedEventConsumer> _logger;

    public ChildDeletedEventConsumer(ILogger<ChildDeletedEventConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ChildDeletedEvent> context)
    {
        var childEvent = context.Message;

        _logger.LogInformation("Processing ChildDeletedEvent for ChildId: {ChildId}", childEvent.ChildId);

        _logger.LogInformation("Child {ChildId} deleted in scheduling service", childEvent.ChildId);
    }
}
