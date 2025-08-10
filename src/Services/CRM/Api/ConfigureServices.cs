using MassTransit.Logging;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using KDVManager.Services.CRM.Api.Telemetry;

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
        var otelEndpoint = configuration["Otel:Endpoint"];
        otel.ConfigureResource(resource => resource.AddService(serviceName: "crm-api"));

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
                    .AddMeter(CrmApiMetrics.Meter.Name); // Add custom metrics

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