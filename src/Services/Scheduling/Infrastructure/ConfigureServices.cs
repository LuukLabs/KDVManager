using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Infrastructure;
using KDVManager.Services.Scheduling.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<SchedulingDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("KDVManagerSchedulingConnectionString")));

        services.AddDbContext<SchedulingDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("KDVManagerSchedulingConnectionString")));

        services.AddScoped<IGroupRepository, GroupRepository>();
        services.AddScoped<ITimeSlotRepository, TimeSlotRepository>();
        services.AddScoped<IScheduleRepository, ScheduleRepository>();

        return services;
    }
}

