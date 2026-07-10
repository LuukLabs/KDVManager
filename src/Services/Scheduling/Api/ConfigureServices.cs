using Microsoft.OpenApi;
using System.Text.Json.Nodes;
using KDVManager.Services.Scheduling.Api.Telemetry;
using KDVManager.Services.Scheduling.Infrastructure;
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

        services.AddHealthChecks()
            .AddDbContextCheck<ApplicationDbContext>("postgres", tags: ["ready"]);

        services.AddControllers();
        // Query handlers (could consider MediatR later)
        services.AddScoped<KDVManager.Services.Scheduling.Application.Features.PrintSchedules.Queries.GetPrintSchedules.GetPrintSchedulesQueryHandler>();
        services.AddOpenApi(options =>
        {
            options.OpenApiVersion = OpenApiSpecVersion.OpenApi3_0;

            options.AddDocumentTransformer((document, context, cancellationToken) =>
            {
                document.Info = new()
                {
                    Version = "v1",
                    Title = "KDVManager Scheduling API",
                    Contact = new()
                    {
                        Name = "Luuk van Hulten",
                        Email = "admin@kdvmanager.nl",
                    },
                };

                return Task.CompletedTask;
            });

            options.AddSchemaTransformer((schema, context, cancellationToken) =>
            {
                if (context.JsonTypeInfo.Type == typeof(TimeSpan))
                {
                    schema.Type = JsonSchemaType.String;
                    schema.Format = "time";
                    schema.Example = JsonValue.Create("14:30:00");
                }

                // ASP.NET Core OpenAPI emits a pattern for integer fields without a type,
                // which causes Orval to generate `unknown` instead of `number`.
                if (schema.Format == "int32" || schema.Format == "int64")
                {
                    schema.Pattern = null;
                    schema.Type = JsonSchemaType.Integer;
                }

                return Task.CompletedTask;
            });

            options.AddOperationTransformer((operation, context, cancellationToken) =>
            {
                if (operation.Parameters != null)
                {
                    foreach (var parameter in operation.Parameters)
                    {
                        if (parameter is OpenApiParameter openApiParameter && !string.IsNullOrEmpty(openApiParameter.Name))
                        {
                            openApiParameter.Name = Char.ToLowerInvariant(openApiParameter.Name[0]) + openApiParameter.Name[1..];
                        }
                    }
                }

                // A 204 response has no body. Remove the empty JSON media type emitted by
                // ASP.NET Core OpenAPI so Orval continues to generate Promise<void>.
                if (operation.Responses?.TryGetValue("204", out var noContentResponse) == true)
                {
                    noContentResponse.Content?.Clear();
                }

                return Task.CompletedTask;
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
