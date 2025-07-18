using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Infrastructure;
using KDVManager.Services.Scheduling.Infrastructure.Repositories;
using KDVManager.Services.Scheduling.Application.Events;
using KDVManager.Shared.Infrastructure.Extensions;
using KDVManager.Shared.Infrastructure.MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MassTransit;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("KDVManagerSchedulingConnectionString")));

        services.AddScoped<IChildRepository, ChildRepository>();
        services.AddScoped<IGroupRepository, GroupRepository>();
        services.AddScoped<ITimeSlotRepository, TimeSlotRepository>();
        services.AddScoped<IScheduleRepository, ScheduleRepository>();

        // Add tenant services from shared infrastructure
        services.AddTenantServices();

        // Add MassTransit infrastructure services
        services.AddMassTransitInfrastructureServices();

        return services;
    }

    private static IServiceCollection AddMassTransitInfrastructureServices(this IServiceCollection services)
    {
        // Register tenant-aware filters
        services.AddScoped<TenantPublishFilter>();
        
        return services;
    }

    public static IServiceCollection AddMassTransitServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMassTransit(x =>
        {
            x.AddConsumer<ChildAddedEventConsumer>();
            x.AddConsumer<ChildUpdatedEventConsumer>();

            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(configuration.GetConnectionString("RabbitMQ"));

                // Apply tenant resolution middleware globally
                cfg.UseTenantResolution(context);

                cfg.ReceiveEndpoint("scheduling-child-events", e =>
                {
                    e.ConfigureConsumer<ChildAddedEventConsumer>(context);
                    e.ConfigureConsumer<ChildUpdatedEventConsumer>(context);
                });
            });
        });

        return services;
    }
}

