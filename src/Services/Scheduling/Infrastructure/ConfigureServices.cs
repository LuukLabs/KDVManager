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
        services.AddScoped<IScheduleTimelineService, ScheduleTimelineService>();
        services.AddScoped<ICalendarRowCacheRepository, CalendarRowCacheRepository>();
        services.AddScoped<ICalendarRowCalculator, CalendarRowCalculator>();
        services.AddScoped<ICalendarRowQueryService, CalendarRowQueryService>();
        services.AddScoped<ICalendarRowInvalidationService, CalendarRowInvalidationService>();
        services.AddHostedService<CalendarRowCacheWarmingService>();

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
