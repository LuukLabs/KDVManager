using KDVManager.Services.ChildManagement.Api.Services;
using KDVManager.Services.ChildManagement.Application.Contracts.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

        services.AddHttpContextAccessor();

        services.AddControllers();

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(options =>
        {
            options.Authority = configuration["Auth0:Domain"];
            options.Audience = configuration["Auth0:ApiIdentifier"];
        });

        services.AddSingleton<ITenantService, TenantService>();

        return services;
    }
}