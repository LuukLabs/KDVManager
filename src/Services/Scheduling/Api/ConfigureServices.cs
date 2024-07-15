using KDVManager.Services.Scheduling.Api.Services;
using KDVManager.Services.Scheduling.Application.Contracts.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using Microsoft.OpenApi.Any;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

        services.AddHttpContextAccessor();

        services.AddControllers();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Version = "v1",
                Title = "KDVManager Scheduling API",
                Contact = new OpenApiContact
                {
                    Name = "Luuk van Hulten",
                    Email = "admin@kdvmanager.nl",
                },
            });

            // Add a custom schema filter to handle TimeSpan as string with time format
            options.MapType<TimeSpan>(() => new OpenApiSchema
            {
                Type = "string",
                Format = "time",
                Example = new OpenApiString("14:30:00")
            });
        });

        services.AddHealthChecks();

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
