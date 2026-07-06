using Microsoft.OpenApi;
using KDVManager.Services.CRM.Api.Telemetry;
using KDVManager.Services.CRM.Infrastructure;
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

        services.AddOpenApi(options =>
        {
            options.OpenApiVersion = Microsoft.OpenApi.OpenApiSpecVersion.OpenApi3_0;

            options.AddDocumentTransformer((document, context, cancellationToken) =>
            {
                document.Info = new()
                {
                    Title = "KDVManager CRM API",
                    Version = "v1",
                    Contact = new()
                    {
                        Name = "Luuk van Hulten",
                        Email = "admin@kdvmanager.nl"
                    }
                };
                return Task.CompletedTask;
            });
            options.AddSchemaTransformer((schema, context, cancellationToken) =>
            {
                if (schema.Properties != null)
                {
                    var newProperties = schema.Properties.ToDictionary(
                        prop => Char.ToLowerInvariant(prop.Key[0]) + prop.Key.Substring(1),
                        prop => prop.Value
                    );
                    schema.Properties = newProperties;
                }
                // ASP.NET Core 9 OpenAPI emits a `pattern` on integer fields and omits the `type`,
                // which causes Orval to generate `unknown` instead of `number`. Fix both.
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
                        if (parameter is OpenApiParameter p && !string.IsNullOrEmpty(p.Name))
                        {
                            p.Name = Char.ToLowerInvariant(p.Name[0]) + p.Name[1..];
                        }
                    }
                }

                return Task.CompletedTask;
            });
        });

        services.AddKdvManagerAuthentication(configuration);

        // Outgoing HTTP correlation propagation
        services.AddTransient<CorrelationIdPropagationHandler>();
        services.AddHttpClient("default")
            .AddHttpMessageHandler<CorrelationIdPropagationHandler>();

        services.AddKdvManagerTelemetry(configuration, "crm-api", CrmApiMetrics.Meter.Name);

        return services;
    }
}