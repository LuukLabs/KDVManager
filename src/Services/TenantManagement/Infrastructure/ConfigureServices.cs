using KDVManager.Services.TenantManagement.Application.Contracts.Identity;
using KDVManager.Services.TenantManagement.Application.Contracts.Persistence;
using KDVManager.Services.TenantManagement.Infrastructure;
using KDVManager.Services.TenantManagement.Infrastructure.Identity;
using KDVManager.Services.TenantManagement.Infrastructure.Repositories;
using KDVManager.Services.TenantManagement.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using KDVManager.Shared.Infrastructure.Tenancy;
using MassTransit;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("KDVManagerTenantManagementConnectionString")));

        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<IMembershipRepository, MembershipRepository>();
        services.AddScoped<KDVManager.Shared.Contracts.Trial.ITrialStatusService, TrialStatusService>();

        // Identity provisioning: write the app-owned tenant id back to Auth0 when
        // configured; otherwise no-op (local/dev/e2e).
        var auth0Options = new Auth0ManagementOptions();
        configuration.GetSection("Auth0").Bind(auth0Options);
        services.Configure<Auth0ManagementOptions>(configuration.GetSection("Auth0"));

        if (auth0Options.IsConfigured)
        {
            services.AddHttpClient();
            services.AddSingleton<IIdentityProvisioningService, Auth0IdentityProvisioningService>();
        }
        else
        {
            services.AddSingleton<IIdentityProvisioningService, NullIdentityProvisioningService>();
        }

        services.AddTenancy();

        return services;
    }

    public static IServiceCollection AddMassTransitServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped(typeof(MassTransitTenancySendFilter<>));

        services.AddMassTransit(x =>
        {
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
