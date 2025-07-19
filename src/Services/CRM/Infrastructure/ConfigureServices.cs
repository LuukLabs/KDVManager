using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Infrastructure;
using KDVManager.Services.CRM.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Infrastructure.Tenancy;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("KDVManagerCRMConnectionString")));

        services.AddScoped<IChildRepository, ChildRepository>();
        services.AddScoped<IPersonRepository, PersonRepository>();

        services.AddScoped<ITenancyResolver, JwtTenancyResolver>();
        services.AddScoped<ITenancyContext, DefaultTenancyContext>();

        return services;
    }
}

