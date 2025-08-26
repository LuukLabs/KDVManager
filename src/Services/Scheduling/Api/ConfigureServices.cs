using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using Microsoft.OpenApi.Any;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using OpenTelemetry.Metrics;
using MassTransit.Logging;
using KDVManager.Services.Scheduling.Api.Telemetry;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

        services.AddHttpContextAccessor();

        services.AddHealthChecks();

        services.AddControllers();
        // Query handlers (could consider MediatR later)
        services.AddScoped<KDVManager.Services.Scheduling.Application.Features.PrintSchedules.Queries.GetPrintSchedules.GetPrintSchedulesQueryHandler>();
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


        var otel = services.AddOpenTelemetry();
        var otelEndpoint = configuration["Otel:Endpoint"];
        otel.ConfigureResource(resource => resource.AddService(serviceName: "scheduling-api"));

        otel.WithTracing(tracing =>
            {
                tracing
                    .AddAspNetCoreInstrumentation(options =>
                    {
                        // Configure ASP.NET Core instrumentation for better error tracking
                        options.RecordException = true;
                        options.EnrichWithHttpRequest = (activity, httpRequest) =>
                        {
                            activity.SetTag("http.request.body.size", httpRequest.ContentLength);
                            activity.SetTag("http.request.client_ip", httpRequest.HttpContext.Connection.RemoteIpAddress?.ToString());
                        };
                        options.EnrichWithHttpResponse = (activity, httpResponse) =>
                        {
                            activity.SetTag("http.response.body.size", httpResponse.ContentLength);
                        };
                        options.EnrichWithException = (activity, exception) =>
                        {
                            activity.SetTag("exception.type", exception.GetType().FullName);
                            activity.SetTag("exception.stacktrace", exception.StackTrace);
                        };
                    })
                    .AddHttpClientInstrumentation(options =>
                    {
                        options.RecordException = true;
                        options.EnrichWithException = (activity, exception) =>
                        {
                            activity.SetTag("exception.type", exception.GetType().FullName);
                            activity.SetTag("exception.message", exception.Message);
                        };
                    })
                    .AddSource(DiagnosticHeaders.DefaultListenerName);

                if (!string.IsNullOrWhiteSpace(otelEndpoint))
                {
                    tracing.AddOtlpExporter(options =>
                    {
                        options.Endpoint = new Uri(otelEndpoint);
                    });
                }
            });

        otel.WithMetrics(metrics =>
            {
                metrics
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddRuntimeInstrumentation()
                    .AddMeter(SchedulingApiMetrics.Meter.Name); // Add custom metrics

                if (!string.IsNullOrWhiteSpace(otelEndpoint))
                {
                    metrics.AddOtlpExporter(options =>
                    {
                        options.Endpoint = new Uri(otelEndpoint);
                    });
                }
            });

        return services;
    }
}
