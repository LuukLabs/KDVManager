using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Infrastructure;
using KDVManager.Services.CRM.Infrastructure.Repositories;
using KDVManager.Shared.Infrastructure.Extensions;
using KDVManager.Shared.Infrastructure.MassTransit;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("KDVManagerCRMConnectionString")));

        services.AddScoped<IChildRepository, ChildRepository>();
        services.AddScoped<IPersonRepository, PersonRepository>();

        // Add shared tenant services
        services.AddTenantServices();

        return services;
    }

    public static IServiceCollection AddMassTransitInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Register the tenant publish filter
        services.AddScoped<TenantPublishFilter>();
        
        services.AddMassTransit(x =>
        {
            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(configuration.GetConnectionString("RabbitMQ"));
                cfg.UseTenantResolution(context); // Add tenant filters for automatic header injection
                cfg.ConfigureEndpoints(context);
            });
        });

        return services;
    }
}

