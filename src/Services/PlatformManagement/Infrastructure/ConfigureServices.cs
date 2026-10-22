using KDVManager.Services.PlatformManagement.Application.Contracts.Persistence;
using KDVManager.Services.PlatformManagement.Infrastructure;
using KDVManager.Services.PlatformManagement.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using KDVManager.Shared.Infrastructure.Tenancy;
using MassTransit;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("KDVManagerPlatformManagementConnectionString")));

        services.AddScoped<ITenantRepository, TenantRepository>();

        // Registers the tenancy context accessor required by the shared telemetry pipeline
        // (TenantEnrichmentProcessor). This service operates at platform level, so the
        // tenancy middleware is never added and no tenant context is ever set.
        services.AddTenancy();

        return services;
    }

    public static IServiceCollection AddMassTransitServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMassTransit(x =>
        {
            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(configuration.GetConnectionString("RabbitMQ"));
                cfg.ConfigureEndpoints(context);

                // No tenancy filters: this service operates at platform level and
                // publishes events that identify the tenant in the message body.
            });
        });

        return services;
    }
}
