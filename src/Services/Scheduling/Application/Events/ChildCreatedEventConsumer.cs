using System;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Shared.Events;
using KDVManager.Services.Scheduling.Application.Commands.CreateChild;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.Scheduling.Application.Events;

public class ChildCreatedEventConsumer : IConsumer<ChildCreatedEvent>
{
    private readonly ILogger<ChildCreatedEventConsumer> _logger;
    private readonly CreateChildCommandHandler _createChildCommandHandler;

    public ChildCreatedEventConsumer(ILogger<ChildCreatedEventConsumer> logger, CreateChildCommandHandler createChildCommandHandler)
    {
        _logger = logger;
        _createChildCommandHandler = createChildCommandHandler;
    }

    public async Task Consume(ConsumeContext<ChildCreatedEvent> context)
    {
        var childEvent = context.Message;

        _logger.LogInformation("Processing ChildCreatedEvent for ChildId: {ChildId}", childEvent.ChildId);

        var command = new CreateChildCommand
        {
            Id = childEvent.ChildId,
            BirthDate = childEvent.DateOfBirth
        };

        await _createChildCommandHandler.Handle(command);

        _logger.LogInformation("Child {ChildId} created in scheduling service", childEvent.ChildId);
    }
}
