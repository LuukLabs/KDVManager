using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Infrastructure;
using KDVManager.Services.Scheduling.Infrastructure.Repositories;
using KDVManager.Services.Scheduling.Application.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MassTransit;
using KDVManager.Shared.Infrastructure.Tenancy;
using KDVManager.Services.Scheduling.Infrastructure.Services;
using KDVManager.Services.Scheduling.Application.Services;
using KDVManager.Services.Scheduling.Application.Contracts.Services;

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
        services.AddScoped<IAbsenceRepository, AbsenceRepository>();
        services.AddScoped<IClosurePeriodRepository, ClosurePeriodRepository>();
        services.AddScoped<IEndMarkRepository, EndMarkRepository>();
        services.AddScoped<IEndMarkSettingsRepository, EndMarkSettingsRepository>();
        services.AddScoped<IScheduleTimelineService, ScheduleTimelineService>();
        services.AddScoped<IEndMarkAutomationService, EndMarkAutomationService>();
        services.AddScoped<IScheduleStatusService, ScheduleStatusService>();

        // Background service for periodic sync of child active status
        services.AddHostedService<ScheduleStatusSyncHostedService>();

        services.AddTenancy();

        return services;
    }

    public static IServiceCollection AddMassTransitServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMassTransit(x =>
        {
            x.AddConsumer<ChildAddedEventConsumer>();
            x.AddConsumer<ChildDeletedEventConsumer>();
            x.AddConsumer<ChildUpdatedEventConsumer>();

            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(configuration.GetConnectionString("RabbitMQ"));
                cfg.ConfigureEndpoints(context);

                cfg.UseConsumeFilter(typeof(MassTransitTenancyConsumeFilter<>), context);
                cfg.UseSendFilter(typeof(MassTransitTenancySendFilter<>), context);
                cfg.UsePublishFilter(typeof(MassTransitTenancyPublishFilter<>), context);
            });
        });

        return services;
    }
}
