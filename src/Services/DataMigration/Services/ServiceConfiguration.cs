using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using KDVManager.Services.DataMigration.Migrators;
using CrmContext = KDVManager.Services.CRM.Infrastructure.ApplicationDbContext;
using SchedulingContext = KDVManager.Services.Scheduling.Infrastructure.ApplicationDbContext;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.DataMigration.Services;

public static class ServiceConfiguration
{
    public static void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        // Register configuration as a service
        services.AddSingleton<IConfiguration>(configuration);

        // Configure CRM Database Context
        services.AddDbContext<CrmContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("KDVManagerCRMConnectionString")));

        // Configure Scheduling Database Context
        services.AddDbContext<SchedulingContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("KDVManagerSchedulingConnectionString")));

        // Add tenant service with a default tenant for migration
        services.AddScoped<ITenancyContext, MigrationTenancyContext>();

        // Add migrators
        services.AddScoped<ChildrenDataMigrator>();
        services.AddScoped<SchedulingDataMigrator>();
    }
}
