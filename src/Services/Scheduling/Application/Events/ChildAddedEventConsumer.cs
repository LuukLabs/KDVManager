using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Features.Children.Commands.AddChild;
using KDVManager.Shared.Contracts.Events;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.Scheduling.Application.Events;

public class ChildAddedEventConsumer : IConsumer<ChildAddedEvent>
{
    private readonly ILogger<ChildAddedEventConsumer> _logger;
    private readonly AddChildCommandHandler _addChildCommandHandler;

    public ChildAddedEventConsumer(
        ILogger<ChildAddedEventConsumer> logger,
        AddChildCommandHandler addChildCommandHandler)
    {
        _logger = logger;
        _addChildCommandHandler = addChildCommandHandler;
    }

    public async Task Consume(ConsumeContext<ChildAddedEvent> context)
    {
        var childEvent = context.Message;

        _logger.LogInformation("Processing ChildAddedEvent for ChildId: {ChildId}",
            childEvent.ChildId);

        var command = new AddChildCommand
        {
            Id = childEvent.ChildId,
            DateOfBirth = childEvent.DateOfBirth
        };

        await _addChildCommandHandler.Handle(command);

        _logger.LogInformation("Child {ChildId} added in scheduling service",
            childEvent.ChildId);
    }
}