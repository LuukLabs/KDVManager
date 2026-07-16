using KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.DeleteTenant;
using KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.ExtendTrial;
using KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.SetSubscription;
using KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.UpdateTenant;
using KDVManager.Services.TenantManagement.Application.Features.Admin.Queries.ListTenants;
using KDVManager.Services.TenantManagement.Application.Features.Tenants.Commands.ProvisionTenant;
using KDVManager.Services.TenantManagement.Application.Features.Tenants.Queries.GetMyTenant;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<ProvisionTenantCommandHandler>();
        services.AddScoped<GetMyTenantQueryHandler>();
        services.AddScoped<ListTenantsQueryHandler>();
        services.AddScoped<ExtendTrialCommandHandler>();
        services.AddScoped<SetSubscriptionCommandHandler>();
        services.AddScoped<UpdateTenantCommandHandler>();
        services.AddScoped<DeleteTenantCommandHandler>();

        return services;
    }
}
