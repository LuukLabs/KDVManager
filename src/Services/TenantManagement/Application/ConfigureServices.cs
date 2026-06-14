using KDVManager.Services.TenantManagement.Application.Features.Tenants.Commands.ProvisionTenant;
using KDVManager.Services.TenantManagement.Application.Features.Tenants.Queries.GetMyTenant;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<ProvisionTenantCommandHandler>();
        services.AddScoped<GetMyTenantQueryHandler>();

        return services;
    }
}
