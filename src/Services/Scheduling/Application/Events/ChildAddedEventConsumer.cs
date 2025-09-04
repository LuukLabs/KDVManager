using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Features.Children.Commands.AddChild;
using KDVManager.Shared.Contracts.Events;
using MassTransit;
using Microsoft.Extensions.Logging;
using KDVManager.Services.Scheduling.Application.Contracts.Services;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Events;

public class ChildAddedEventConsumer : IConsumer<ChildAddedEvent>
{
    private readonly ILogger<ChildAddedEventConsumer> _logger;
    private readonly AddChildCommandHandler _addChildCommandHandler;
    private readonly IEndMarkAutomationService _endMarkAutomationService;
    private readonly IChildRepository _childRepository;

    public ChildAddedEventConsumer(
        ILogger<ChildAddedEventConsumer> logger,
        AddChildCommandHandler addChildCommandHandler,
        IEndMarkAutomationService endMarkAutomationService,
        IChildRepository childRepository)
    {
        _logger = logger;
        _addChildCommandHandler = addChildCommandHandler;
        _endMarkAutomationService = endMarkAutomationService;
        _childRepository = childRepository;
    }

    public async Task Consume(ConsumeContext<ChildAddedEvent> context)
    {
        var childEvent = context.Message;

        _logger.LogInformation("Processing ChildAddedEvent for ChildId: {ChildId}",
            childEvent.ChildId);

        var command = new AddChildCommand
        {
            Id = childEvent.ChildId,
            DateOfBirth = childEvent.DateOfBirth,
            GivenName = childEvent.GivenName,
            FamilyName = childEvent.FamilyName
        };

        await _addChildCommandHandler.Handle(command);

        // Maintain EndMarks after adding the child
        var child = await _childRepository.GetByIdAsync(childEvent.ChildId);
        if (child != null)
        {
            await _endMarkAutomationService.MaintainEndMarkAsync(child, context.CancellationToken);
        }

        _logger.LogInformation("Child {ChildId} added in scheduling service",
            childEvent.ChildId);
    }
}