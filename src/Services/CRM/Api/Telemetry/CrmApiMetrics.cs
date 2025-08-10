using System.Diagnostics.Metrics;

namespace KDVManager.Services.CRM.Api.Telemetry;

public static class CrmApiMetrics
{
    public static readonly Meter Meter = new("crm-api", "1.0.0");

    public static readonly Counter<long> ErrorCounter = Meter.CreateCounter<long>(
        "crm_api_errors_total",
        "Total number of errors in CRM API");

    public static readonly Counter<long> RequestCounter = Meter.CreateCounter<long>(
        "crm_api_requests_total",
        "Total number of requests to CRM API");

    public static readonly Histogram<double> RequestDuration = Meter.CreateHistogram<double>(
        "crm_api_request_duration_seconds",
        "Duration of HTTP requests in seconds");
}
