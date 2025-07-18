using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Shared.Domain.Services;
using KDVManager.Shared.Domain.Tenancy;
using KDVManager.Shared.Infrastructure.MassTransit;
using KDVManager.Shared.Infrastructure.Tenancy;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;

namespace KDVManager.Shared.Infrastructure.Extensions;

/// <summary>
/// Extension methods for configuring tenant-aware MassTransit middleware and services
/// </summary>
public static class TenantMassTransitExtensions
{
    /// <summary>
    /// Adds tenant services required for both HTTP and MassTransit contexts
    /// </summary>
    /// <param name="services">The service collection</param>
    /// <returns>The service collection for chaining</returns>
    public static IServiceCollection AddTenantServices(this IServiceCollection services)
    {
        // Register the tenant context for MassTransit consumers
        services.AddScoped<ITenantContext, TenantContext>();

        // Register the unified tenant service that works for both HTTP and MassTransit
        services.AddScoped<ITenantService, TenantService>();

        return services;
    }

    /// <summary>
    /// Adds tenant resolution middleware to all consumers in the bus configuration
    /// Also adds automatic tenant header injection to all published messages
    /// </summary>
    /// <param name="configurator">The bus configuration</param>
    /// <param name="context">The registration context for dependency injection</param>
    public static void UseTenantResolution(this IBusFactoryConfigurator configurator, IRegistrationContext context)
    {
        configurator.UseConsumeFilter(typeof(TenantResolutionMiddleware<>), context);
        configurator.UsePublishFilter<TenantPublishFilter>(context);
    }

    /// <summary>
    /// Adds tenant resolution middleware to a specific receive endpoint
    /// </summary>
    /// <param name="configurator">The receive endpoint configuration</param>
    /// <param name="context">The registration context for dependency injection</param>
    public static void UseTenantResolution(this IReceiveEndpointConfigurator configurator, IRegistrationContext context)
    {
        configurator.UseConsumeFilter(typeof(TenantResolutionMiddleware<>), context);
    }

    /// <summary>
    /// Publishes a message with the current tenant ID in the headers
    /// </summary>
    /// <typeparam name="T">The message type</typeparam>
    /// <param name="publishEndpoint">The publish endpoint</param>
    /// <param name="message">The message to publish</param>
    /// <param name="tenantService">The tenant service to get current tenant</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>A task representing the asynchronous operation</returns>
    public static async Task PublishWithTenant<T>(this IPublishEndpoint publishEndpoint, T message, ITenantService tenantService, CancellationToken cancellationToken = default)
        where T : class
    {
        var tenantId = tenantService.CurrentTenant;

        await publishEndpoint.Publish(message, context =>
        {
            context.Headers.Set("TenantId", tenantId);
        }, cancellationToken);
    }

    /// <summary>
    /// Publishes a message with a specific tenant ID in the headers
    /// </summary>
    /// <typeparam name="T">The message type</typeparam>
    /// <param name="publishEndpoint">The publish endpoint</param>
    /// <param name="message">The message to publish</param>
    /// <param name="tenantId">The tenant ID to set in headers</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>A task representing the asynchronous operation</returns>
    public static async Task PublishWithTenant<T>(this IPublishEndpoint publishEndpoint, T message, Guid tenantId, CancellationToken cancellationToken = default)
        where T : class
    {
        await publishEndpoint.Publish(message, context =>
        {
            context.Headers.Set("TenantId", tenantId);
        }, cancellationToken);
    }

    /// <summary>
    /// Sends a message with the current tenant ID in the headers
    /// </summary>
    /// <typeparam name="T">The message type</typeparam>
    /// <param name="sendEndpoint">The send endpoint</param>
    /// <param name="message">The message to send</param>
    /// <param name="tenantService">The tenant service to get current tenant</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>A task representing the asynchronous operation</returns>
    public static async Task SendWithTenant<T>(this ISendEndpoint sendEndpoint, T message, ITenantService tenantService, CancellationToken cancellationToken = default)
        where T : class
    {
        var tenantId = tenantService.CurrentTenant;

        await sendEndpoint.Send(message, context =>
        {
            context.Headers.Set("TenantId", tenantId);
        }, cancellationToken);
    }

    /// <summary>
    /// Sends a message with a specific tenant ID in the headers
    /// </summary>
    /// <typeparam name="T">The message type</typeparam>
    /// <param name="sendEndpoint">The send endpoint</param>
    /// <param name="message">The message to send</param>
    /// <param name="tenantId">The tenant ID to set in headers</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>A task representing the asynchronous operation</returns>
    public static async Task SendWithTenant<T>(this ISendEndpoint sendEndpoint, T message, Guid tenantId, CancellationToken cancellationToken = default)
        where T : class
    {
        await sendEndpoint.Send(message, context =>
        {
            context.Headers.Set("TenantId", tenantId);
        }, cancellationToken);
    }
}
