using System;
using System.Threading.Tasks;
using KDVManager.Shared.Contracts.Events;
using KDVManager.Shared.Application.MassTransit;
using KDVManager.Shared.Domain.Services;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.Scheduling.Application.Events;

public class ChildUpdatedEventConsumer : TenantAwareConsumerBase<ChildUpdatedEvent>
{
    public ChildUpdatedEventConsumer(
        ILogger<ChildUpdatedEventConsumer> logger,
        ITenantService tenantService)
        : base(logger, tenantService)
    {
    }

    protected override async Task ConsumeMessage(ConsumeContext<ChildUpdatedEvent> context)
    {
        var childEvent = context.Message;
        var tenantId = TenantService.CurrentTenant;

        Logger.LogInformation("Processing ChildUpdatedEvent for ChildId: {ChildId} in tenant {TenantId}",
            childEvent.ChildId, tenantId);

        var age = DateTime.Today.Year - childEvent.DateOfBirth.Year;
        if (DateTime.Today.DayOfYear < childEvent.DateOfBirth.DayOfYear)
            age--;

        Logger.LogInformation("Child {ChildId} age updated to {Age} years in tenant {TenantId}",
            childEvent.ChildId, age, tenantId);

        if (age > 5)
        {
            Logger.LogInformation("Child {ChildId} is older than 5 years in tenant {TenantId}, consider archiving schedules",
                childEvent.ChildId, tenantId);
        }

        await Task.CompletedTask;
    }
}