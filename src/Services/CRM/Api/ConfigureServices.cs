using MassTransit.Logging;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

        services.AddHttpContextAccessor();

        services.AddHealthChecks();

        services.AddOpenApi(options =>
        {
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
                return Task.CompletedTask;
            });
            options.AddOperationTransformer((operation, context, cancellationToken) =>
            {
                if (operation.Parameters != null)
                {
                    foreach (var parameter in operation.Parameters)
                    {
                        parameter.Name = Char.ToLowerInvariant(parameter.Name[0]) + parameter.Name[1..];
                    }
                }

                return Task.CompletedTask;
            });
        });

        string domain = $"https://{configuration["Auth0:Domain"]}/";
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                    .AddJwtBearer(options =>
                    {
                        options.Authority = domain;
                        options.Audience = configuration["Auth0:Audience"];
                    });
        services.AddAuthorization();

        var otel = services.AddOpenTelemetry();
        var otlpEndpoint = configuration["Otlp:Endpoint"];
        otel.ConfigureResource(resource => resource.AddService(serviceName: "crm-api"));

        otel.WithTracing(tracing =>
            {
                tracing
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddSource(DiagnosticHeaders.DefaultListenerName);

                if (!string.IsNullOrWhiteSpace(otlpEndpoint))
                {
                    tracing.AddOtlpExporter(options =>
                    {
                        options.Endpoint = new Uri(otlpEndpoint);
                    });
                }
            });

        otel.WithMetrics(metrics =>
            {
                metrics
                    .AddAspNetCoreInstrumentation();

                if (!string.IsNullOrWhiteSpace(otlpEndpoint))
                {
                    metrics.AddOtlpExporter(options =>
                    {
                        options.Endpoint = new Uri(otlpEndpoint);
                    });
                }
            });


        return services;
    }
}