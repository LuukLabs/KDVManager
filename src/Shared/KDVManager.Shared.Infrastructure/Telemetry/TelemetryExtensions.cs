using MassTransit.Logging;
using MassTransit.Monitoring;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;

namespace KDVManager.Shared.Infrastructure.Telemetry;

public static class TelemetryExtensions
{
    private const string OtelEndpointConfigKey = "Otel:Endpoint"; // existing config mapping
    private const string OtelEndpointEnvKey = "OTEL_EXPORTER_OTLP_ENDPOINT"; // standard env var
    private const string SamplingRatioConfigKey = "Otel:TraceSamplingRatio";
    private const string SamplingRatioEnvKey = "OTEL_TRACE_SAMPLING_RATIO";

    /// <summary>
    /// Adds OpenTelemetry tracing and metrics with the shared KDVManager resource,
    /// ASP.NET Core/HttpClient/Npgsql instrumentation, MassTransit signals and
    /// OTLP exporters when an endpoint is configured.
    /// </summary>
    public static IServiceCollection AddKdvManagerTelemetry(this IServiceCollection services, IConfiguration configuration, string serviceName, params string[] additionalMeterNames)
    {
        var otelEndpoint = configuration[OtelEndpointConfigKey]
                           ?? Environment.GetEnvironmentVariable(OtelEndpointEnvKey);

        var otel = services.AddOpenTelemetry();

        otel.ConfigureResource(resource => KdvResource.Configure(resource, configuration, serviceName));

        otel.WithTracing(tracing =>
        {
            tracing.SetSampler(new ParentBasedSampler(new TraceIdRatioBasedSampler(GetSamplingRatio(configuration))));
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
                .AddSource(DiagnosticHeaders.DefaultListenerName)
                .AddNpgsql();

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
                .AddMeter(InstrumentationOptions.MeterName);

            foreach (var meterName in additionalMeterNames)
            {
                metrics.AddMeter(meterName);
            }

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

    private static double GetSamplingRatio(IConfiguration configuration)
    {
        var ratio = configuration.GetValue<double?>(SamplingRatioConfigKey);
        if (ratio is null)
        {
            var envRatio = Environment.GetEnvironmentVariable(SamplingRatioEnvKey);
            if (double.TryParse(envRatio, out var parsed)) ratio = parsed;
        }
        ratio ??= 1.0d;
        return Math.Clamp(ratio.Value, 0d, 1d);
    }
}
