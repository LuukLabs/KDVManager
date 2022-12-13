using System;
using KDVManager.Services.ChildManagement.Application.Contracts.Infrastructure;
using KDVManager.Services.ChildManagement.Infrastructure;
using KDVManager.Services.ChildManagement.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ChildManagementDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("KDVManagerChildManagementConnectionString")));

        services.AddDbContext<MigrationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("KDVManagerChildManagementConnectionString")));

        services.AddScoped<IChildRepository, ChildRepository>();

        return services;
    }
}

