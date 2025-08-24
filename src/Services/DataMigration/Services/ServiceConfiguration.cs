// Nullable reference types enabled for correct annotation handling
#nullable enable
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
    public static void ConfigureServices(IServiceCollection services, IConfiguration configuration, string? tenantIdOverride = null)
    {
        // Register configuration as a service
        services.AddSingleton<IConfiguration>(configuration);

        // Configure CRM Database Context
        services.AddDbContext<CrmContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("KDVManagerCRMConnectionString")));

        // Configure Scheduling Database Context
        services.AddDbContext<SchedulingContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("KDVManagerSchedulingConnectionString")));

        if (!Guid.TryParse(tenantIdOverride, out var tenantId))
        {
            throw new InvalidOperationException("A valid --tenant <GUID> must be supplied (no default tenant id).");
        }
        services.AddScoped<ITenancyContextAccessor>(_ => new MigrationTenancyContextAccessor(tenantId));

        // Register anonymizer
        services.AddSingleton<NameAnonymizer>();

        // Add migrators
        services.AddScoped<ChildrenDataMigrator>();
        services.AddScoped<GuardiansDataMigrator>();
        services.AddScoped<SchedulingDataMigrator>();
    }
}
