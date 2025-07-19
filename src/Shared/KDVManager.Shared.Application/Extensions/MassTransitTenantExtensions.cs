using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Shared.Domain.Services;
using MassTransit;

namespace KDVManager.Shared.Application.Extensions;

public static class MassTransitTenantExtensions
{
    /// <summary>
    /// Publishes a message with tenant information automatically added to headers.
    /// This should be the default publishing method in multi-tenant applications.
    /// </summary>
    public static async Task PublishTenantAware<T>(this IPublishEndpoint publishEndpoint, T message, ITenantService tenantService, CancellationToken cancellationToken = default)
        where T : class
    {
        await publishEndpoint.Publish(message, context =>
        {
            var tenantId = tenantService.CurrentTenant;
            if (tenantId != Guid.Empty)
            {
                context.Headers.Set("TenantId", tenantId.ToString());
            }
        }, cancellationToken);
    }

    /// <summary>
    /// Sends a message with tenant information automatically added to headers.
    /// This should be the default sending method in multi-tenant applications.
    /// </summary>
    public static async Task SendTenantAware<T>(this ISendEndpoint sendEndpoint, T message, ITenantService tenantService, CancellationToken cancellationToken = default)
        where T : class
    {
        await sendEndpoint.Send(message, context =>
        {
            var tenantId = tenantService.CurrentTenant;
            if (tenantId != Guid.Empty)
            {
                context.Headers.Set("TenantId", tenantId.ToString());
            }
        }, cancellationToken);
    }

    /// <summary>
    /// Legacy method for explicit tenant publishing. Use PublishTenantAware instead.
    /// </summary>
    [Obsolete("Use PublishTenantAware(message, tenantService) instead for consistent tenant handling")]
    public static async Task PublishWithTenant<T>(this IPublishEndpoint publishEndpoint, T message, ITenantService tenantService, CancellationToken cancellationToken = default)
        where T : class
    {
        await publishEndpoint.PublishTenantAware(message, tenantService, cancellationToken);
    }

    /// <summary>
    /// Legacy method for explicit tenant sending. Use SendTenantAware instead.
    /// </summary>
    [Obsolete("Use SendTenantAware(message, tenantService) instead for consistent tenant handling")]
    public static async Task SendWithTenant<T>(this ISendEndpoint sendEndpoint, T message, ITenantService tenantService, CancellationToken cancellationToken = default)
        where T : class
    {
        await sendEndpoint.SendTenantAware(message, tenantService, cancellationToken);
    }
}
