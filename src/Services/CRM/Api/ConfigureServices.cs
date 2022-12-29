using KDVManager.Services.CRM.Api.Services;
using KDVManager.Services.CRM.Application.Contracts.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

        services.AddHttpContextAccessor();

        services.AddControllers();

        string domain = $"https://{configuration["Auth0:Domain"]}/";
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = domain;
                options.Audience = configuration["Auth0:Audience"];
            });

        services.AddScoped<ITenantService, TenantService>();

        return services;
    }
}