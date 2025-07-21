using System;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Features.Children.Commands.DeleteChild;
using KDVManager.Shared.Contracts.Events;

using MassTransit;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.Scheduling.Application.Events;

public class ChildDeletedEventConsumer : IConsumer<ChildDeletedEvent>
{
    private readonly ILogger<ChildDeletedEventConsumer> _logger;
    private readonly DeleteChildCommandHandler _deleteChildCommandHandler;

    public ChildDeletedEventConsumer(ILogger<ChildDeletedEventConsumer> logger,
    DeleteChildCommandHandler deleteChildCommandHandler)
    {
        _logger = logger;
        _deleteChildCommandHandler = deleteChildCommandHandler;
    }

    public async Task Consume(ConsumeContext<ChildDeletedEvent> context)
    {
        var childEvent = context.Message;

        _logger.LogInformation("Processing ChildDeletedEvent for ChildId: {ChildId}", childEvent.ChildId);

        var command = new DeleteChildCommand
        {
            Id = childEvent.ChildId
        };

        await _deleteChildCommandHandler.Handle(command);

        _logger.LogInformation("Child {ChildId} deleted in scheduling service", childEvent.ChildId);
    }
}
