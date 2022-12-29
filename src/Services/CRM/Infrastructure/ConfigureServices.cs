using System;
using KDVManager.Services.CRM.Application.Contracts.Infrastructure;
using KDVManager.Services.CRM.Infrastructure;
using KDVManager.Services.CRM.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<CRMDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("KDVManagerCRMConnectionString")));

        services.AddDbContext<MigrationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("KDVManagerCRMConnectionString")));

        services.AddScoped<IChildRepository, ChildRepository>();

        return services;
    }
}

