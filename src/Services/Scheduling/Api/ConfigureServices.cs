using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using Microsoft.OpenApi.Any;
using Microsoft.IdentityModel.Tokens;
using KDVManager.Shared.Contracts.Tenancy;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

        services.AddHttpContextAccessor();

        services.AddHealthChecks();

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

            options.DescribeAllParametersInCamelCase();

            // Add a custom schema filter to handle TimeSpan as string with time format
            options.MapType<TimeSpan>(() => new OpenApiSchema
            {
                Type = "string",
                Format = "time",
                Example = new OpenApiString("14:30:00")
            });
        });

        string domain = $"https://{configuration["Auth0:Domain"]}/";
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = domain;
                options.Audience = configuration["Auth0:Audience"];

                // Production security settings
                options.RequireHttpsMetadata = true;
                options.SaveToken = false; // Don't store tokens in AuthenticationProperties for security
                options.IncludeErrorDetails = false; // Don't include detailed error info in production

                // Token validation parameters
                options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ClockSkew = TimeSpan.FromMinutes(5), // Allow 5 minutes clock skew
                    RequireExpirationTime = true,
                    RequireSignedTokens = true
                };

                // Optional: Add custom event handlers for monitoring
                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        // Log authentication failures (implement logging as needed)
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        // Optional: Add custom claims validation
                        return Task.CompletedTask;
                    }
                };
            });

        return services;
    }
}
