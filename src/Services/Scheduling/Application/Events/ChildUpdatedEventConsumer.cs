using System;
using System.Threading.Tasks;
using KDVManager.Shared.Contracts.Events;
using MassTransit;
using Microsoft.Extensions.Logging;
using KDVManager.Services.Scheduling.Application.Features.Children.Commands.UpdateChild;
using KDVManager.Services.Scheduling.Application.Contracts.Services;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Events;

public class ChildUpdatedEventConsumer : IConsumer<ChildUpdatedEvent>
{
    private readonly ILogger<ChildUpdatedEventConsumer> _logger;
    private readonly UpdateChildCommandHandler _updateChildCommandHandler;
    private readonly IEndMarkAutomationService _endMarkAutomationService;
    private readonly IChildRepository _childRepository;

    public ChildUpdatedEventConsumer(
        ILogger<ChildUpdatedEventConsumer> logger,
        UpdateChildCommandHandler updateChildCommandHandler,
        IEndMarkAutomationService endMarkAutomationService,
        IChildRepository childRepository)
    {
        _logger = logger;
        _updateChildCommandHandler = updateChildCommandHandler;
        _endMarkAutomationService = endMarkAutomationService;
        _childRepository = childRepository;
    }

    public async Task Consume(ConsumeContext<ChildUpdatedEvent> context)
    {
        var childEvent = context.Message;

        _logger.LogInformation("Processing ChildUpdatedEvent for ChildId: {ChildId}", childEvent.ChildId);

        var command = new UpdateChildCommand
        {
            Id = childEvent.ChildId,
            DateOfBirth = childEvent.DateOfBirth,
            GivenName = childEvent.GivenName,
            FamilyName = childEvent.FamilyName
        };

        await _updateChildCommandHandler.Handle(command);

        // Maintain EndMarks after updating the child
        var child = await _childRepository.GetByIdAsync(childEvent.ChildId);
        if (child != null)
        {
            await _endMarkAutomationService.MaintainEndMarkAsync(child, context.CancellationToken);
        }

        _logger.LogInformation("Child {ChildId} updated in scheduling service", childEvent.ChildId);
    }
}
