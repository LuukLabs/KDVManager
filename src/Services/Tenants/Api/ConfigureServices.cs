using MassTransit.Logging;
using Microsoft.OpenApi;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using KDVManager.Services.Tenants.Api.Telemetry;
using KDVManager.Shared.Infrastructure.Auth;
using KDVManager.Shared.Infrastructure.Http;

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
            options.OpenApiVersion = Microsoft.OpenApi.OpenApiSpecVersion.OpenApi3_0;

            options.AddDocumentTransformer((document, context, cancellationToken) =>
            {
                document.Info = new()
                {
                    Title = "KDVManager Tenants API",
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

        services.AddKdvManagerSuperAdminAuthentication(configuration);

        services.AddTransient<CorrelationIdPropagationHandler>();
        services.AddHttpClient("default")
            .AddHttpMessageHandler<CorrelationIdPropagationHandler>();

        var otel = services.AddOpenTelemetry();
        var otelEndpoint = configuration["Otel:Endpoint"];
        otel.ConfigureResource(resource => resource.AddService(serviceName: "tenants-api"));

        otel.WithTracing(tracing =>
                {
                    var ratio = configuration.GetValue<double?>("Otel:TraceSamplingRatio");
                    if (ratio is null)
                    {
                        var envRatio = Environment.GetEnvironmentVariable("OTEL_TRACE_SAMPLING_RATIO");
                        if (double.TryParse(envRatio, out var parsed)) ratio = parsed;
                    }
                    ratio ??= 1.0d;
                    ratio = Math.Clamp(ratio.Value, 0d, 1d);

                    tracing.SetSampler(new ParentBasedSampler(new TraceIdRatioBasedSampler(ratio.Value)));
                    tracing
                        .AddAspNetCoreInstrumentation(options =>
                        {
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
                    .AddMeter(TenantsApiMetrics.Meter.Name);

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
