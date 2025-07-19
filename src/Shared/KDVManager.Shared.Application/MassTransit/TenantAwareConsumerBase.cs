using System;
using System.Threading.Tasks;
using KDVManager.Shared.Domain.Services;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace KDVManager.Shared.Application.MassTransit;

/// <summary>
/// Base consumer class that provides tenant-aware functionality for MassTransit consumers
/// Tenant information is extracted from message headers
/// </summary>
/// <typeparam name="TMessage">The message type to consume</typeparam>
public abstract class TenantAwareConsumerBase<TMessage> : IConsumer<TMessage>
    where TMessage : class
{
    protected readonly ILogger Logger;
    protected readonly ITenantService TenantService;

    protected TenantAwareConsumerBase(ILogger logger, ITenantService tenantService)
    {
        Logger = logger ?? throw new ArgumentNullException(nameof(logger));
        TenantService = tenantService ?? throw new ArgumentNullException(nameof(tenantService));
    }

    public async Task Consume(ConsumeContext<TMessage> context)
    {
        var message = context.Message;

        try
        {
            // Get tenant from current context (set by TenantResolutionMiddleware)
            var currentTenant = TenantService.CurrentTenant;

            Logger.LogInformation("Processing {MessageType} for tenant {TenantId}",
                typeof(TMessage).Name, currentTenant);

            await ConsumeMessage(context);

            Logger.LogInformation("Successfully processed {MessageType} for tenant {TenantId}",
                typeof(TMessage).Name, currentTenant);
        }
        catch (Exception ex)
        {
            var tenantInfo = "unknown";
            try
            {
                tenantInfo = TenantService.CurrentTenant.ToString();
            }
            catch
            {
                // Ignore tenant resolution errors in error logging
            }

            Logger.LogError(ex, "Error processing {MessageType} for tenant {TenantId}",
                typeof(TMessage).Name, tenantInfo);
            throw;
        }
    }

    /// <summary>
    /// Override this method to implement the message consumption logic
    /// </summary>
    /// <param name="context">The consume context</param>
    /// <summary>
    /// Derived classes must implement this method to process the actual message
    /// </summary>
    protected abstract Task ConsumeMessage(ConsumeContext<TMessage> context);

    /// <summary>
    /// Gets the current tenant ID for the message being processed
    /// </summary>
    protected Guid GetCurrentTenantId() => TenantService.CurrentTenant;
}
