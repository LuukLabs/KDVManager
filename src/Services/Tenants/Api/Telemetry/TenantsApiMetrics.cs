using System.Diagnostics.Metrics;

namespace KDVManager.Services.Tenants.Api.Telemetry;

public static class TenantsApiMetrics
{
    public static readonly Meter Meter = new("tenants-api", "1.0.0");

    public static readonly Counter<long> ErrorCounter = Meter.CreateCounter<long>(
        "tenants_api_errors_total",
        "Total number of errors in Tenants API");

    public static readonly Counter<long> RequestCounter = Meter.CreateCounter<long>(
        "tenants_api_requests_total",
        "Total number of requests to Tenants API");

    public static readonly Histogram<double> RequestDuration = Meter.CreateHistogram<double>(
        "tenants_api_request_duration_seconds",
        "Duration of HTTP requests in seconds");
}
