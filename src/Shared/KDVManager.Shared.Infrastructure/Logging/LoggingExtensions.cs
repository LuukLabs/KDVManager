using System.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using OpenTelemetry.Logs;
using OpenTelemetry.Resources;

namespace KDVManager.Shared.Infrastructure.Logging;

public static class LoggingExtensions
{
    private const string ServiceNameKey = "OTEL_SERVICE_NAME"; // conventional env var
    private const string OtelEndpointConfigKey = "Otel:Endpoint"; // existing config mapping
    private const string OtelEndpointEnvKey = "OTEL_EXPORTER_OTLP_ENDPOINT"; // standard env var

    /// <summary>
    /// Adds production-grade structured logging using OpenTelemetry + OTLP exporter.
    /// Falls back to console only when no endpoint configured.
    /// </summary>
    public static ILoggingBuilder AddKdvManagerLogging(this ILoggingBuilder logging, IConfiguration configuration, string? explicitServiceName = null)
    {
        var serviceName = explicitServiceName
                          ?? Environment.GetEnvironmentVariable(ServiceNameKey)
                          ?? configuration["Service:Name"]
                          ?? AppDomain.CurrentDomain.FriendlyName;

    var otelEndpoint = Environment.GetEnvironmentVariable(OtelEndpointEnvKey)
                ?? configuration[OtelEndpointConfigKey];

        logging.ClearProviders();

        // Structured JSON console for Kubernetes ingestion.
        logging.AddJsonConsole(o =>
        {
            o.IncludeScopes = true;
            o.UseUtcTimestamp = true;
            o.TimestampFormat = "yyyy-MM-ddTHH:mm:ss.fffZ";
        });

        if (!string.IsNullOrWhiteSpace(otelEndpoint))
        {
            logging.AddOpenTelemetry(otel =>
            {
                otel.IncludeScopes = true;
                otel.IncludeFormattedMessage = true;
                otel.ParseStateValues = true;
                var instanceId = Environment.GetEnvironmentVariable("SERVICE_INSTANCE_ID") ?? Guid.NewGuid().ToString();
                otel.SetResourceBuilder(ResourceBuilder.CreateDefault()
                    .AddService(serviceName: serviceName, serviceVersion: GetVersion(), serviceInstanceId: instanceId)
                    .AddAttributes(new KeyValuePair<string, object?>[]
                    {
                        new("deployment.environment", configuration["ASPNETCORE_ENVIRONMENT"] ?? "Production"),
                        new("service.namespace", "KDVManager"),
                        new("host.name", Environment.MachineName)
                    }));

                otel.AddOtlpExporter(exp =>
                {
                    if (Uri.TryCreate(otelEndpoint, UriKind.Absolute, out var uri))
                    {
                        exp.Endpoint = uri;
                    }
                });
            });
        }

        return logging;
    }

    private static string GetVersion()
    {
        try
        {
            return typeof(LoggingExtensions).Assembly.GetName().Version?.ToString() ?? "unknown";
        }
        catch
        {
            return "unknown";
        }
    }
}
