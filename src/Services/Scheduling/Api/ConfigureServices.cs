using Microsoft.OpenApi;
using System.Text.Json.Nodes;
using KDVManager.Services.Scheduling.Api.Telemetry;
using KDVManager.Shared.Infrastructure.Auth;
using KDVManager.Shared.Infrastructure.Http;
using KDVManager.Shared.Infrastructure.Telemetry;

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
                Type = JsonSchemaType.String,
                Format = "time",
                Example = JsonValue.Create("14:30:00")
            });
        });

        services.AddKdvManagerAuthentication(configuration);

        // Outgoing HTTP correlation propagation
        services.AddTransient<CorrelationIdPropagationHandler>();
        services.AddHttpClient("default")
            .AddHttpMessageHandler<CorrelationIdPropagationHandler>();

        services.AddKdvManagerTelemetry(configuration, "scheduling-api", SchedulingApiMetrics.Meter.Name);

        return services;
    }
}
