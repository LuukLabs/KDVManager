using System;
using System.Threading.Tasks;
using KDVManager.Shared.Contracts.Events;
using MassTransit;
using Microsoft.Extensions.Logging;
using KDVManager.Services.Scheduling.Application.Features.Children.Commands.UpdateChild;

namespace KDVManager.Services.Scheduling.Application.Events;

public class ChildUpdatedEventConsumer : IConsumer<ChildUpdatedEvent>
{
    private readonly ILogger<ChildUpdatedEventConsumer> _logger;
    private readonly UpdateChildCommandHandler _updateChildCommandHandler;

    public ChildUpdatedEventConsumer(ILogger<ChildUpdatedEventConsumer> logger, UpdateChildCommandHandler updateChildCommandHandler)
    {
        _logger = logger;
        _updateChildCommandHandler = updateChildCommandHandler;
    }

    public async Task Consume(ConsumeContext<ChildUpdatedEvent> context)
    {
        var childEvent = context.Message;

        _logger.LogInformation("Processing ChildUpdatedEvent for ChildId: {ChildId}", childEvent.ChildId);

        var command = new UpdateChildCommand
        {
            Id = childEvent.ChildId,
            DateOfBirth = childEvent.DateOfBirth
        };

        await _updateChildCommandHandler.Handle(command);

        _logger.LogInformation("Child {ChildId} updated in scheduling service", childEvent.ChildId);
    }
}
