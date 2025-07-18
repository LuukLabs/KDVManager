using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Features.Children.Commands.AddChild;
using KDVManager.Shared.Contracts.Events;
using KDVManager.Shared.Application.MassTransit;
using KDVManager.Shared.Domain.Services;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.Scheduling.Application.Events;

public class ChildAddedEventConsumer : TenantAwareConsumerBase<ChildAddedEvent>
{
    private readonly AddChildCommandHandler _addChildCommandHandler;

    public ChildAddedEventConsumer(
        ILogger<ChildAddedEventConsumer> logger,
        ITenantService tenantService,
        AddChildCommandHandler addChildCommandHandler)
        : base(logger, tenantService)
    {
        _addChildCommandHandler = addChildCommandHandler;
    }

    protected override async Task ConsumeMessage(ConsumeContext<ChildAddedEvent> context)
    {
        var childEvent = context.Message;
        var tenantId = GetCurrentTenantId();

        Logger.LogInformation("Processing ChildAddedEvent for ChildId: {ChildId} in tenant {TenantId}",
            childEvent.ChildId, tenantId);

        var command = new AddChildCommand
        {
            Id = childEvent.ChildId,
            BirthDate = childEvent.DateOfBirth
        };

        await _addChildCommandHandler.Handle(command);

        Logger.LogInformation("Child {ChildId} added in scheduling service for tenant {TenantId}",
            childEvent.ChildId, tenantId);
    }
}