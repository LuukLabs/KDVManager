using KDVManager.Services.Tenants.Application.Features.Tenants.Commands.AddTenant;
using KDVManager.Services.Tenants.Application.Features.Tenants.Commands.UpdateTenant;
using KDVManager.Services.Tenants.Application.Features.Tenants.Commands.ActivateTenant;
using KDVManager.Services.Tenants.Application.Features.Tenants.Commands.DeactivateTenant;
using KDVManager.Services.Tenants.Application.Features.Tenants.Queries.GetTenantList;
using KDVManager.Services.Tenants.Application.Features.Tenants.Queries.GetTenantDetail;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register handlers
        services.AddScoped<AddTenantCommandHandler>();
        services.AddScoped<UpdateTenantCommandHandler>();
        services.AddScoped<ActivateTenantCommandHandler>();
        services.AddScoped<DeactivateTenantCommandHandler>();
        services.AddScoped<GetTenantListQueryHandler>();
        services.AddScoped<GetTenantDetailQueryHandler>();

        return services;
    }
}
