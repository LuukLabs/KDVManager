using KDVManager.Services.PlatformManagement.Application.Features.Tenants.Commands.CreateTenant;
using KDVManager.Services.PlatformManagement.Application.Features.Tenants.Commands.DeleteTenant;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register handlers
        services.AddScoped<CreateTenantCommandHandler>();
        services.AddScoped<DeleteTenantCommandHandler>();

        return services;
    }
}
