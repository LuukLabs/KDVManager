using System.Diagnostics.Metrics;

namespace KDVManager.Shared.Infrastructure.Telemetry;

/// <summary>
/// Per-service API meter and counters. Register as a singleton with the service's
/// meter name (e.g. "crm-api"); the error counter name derives from it
/// (e.g. "crm_api_errors_total").
/// </summary>
public sealed class ApiMetrics
{
    public string ServiceName { get; }
    public Meter Meter { get; }
    public Counter<long> ErrorCounter { get; }

    public ApiMetrics(string serviceName)
    {
        ServiceName = serviceName;
        Meter = new Meter(serviceName, "1.0.0");
        ErrorCounter = Meter.CreateCounter<long>(
            $"{serviceName.Replace('-', '_')}_errors_total",
            unit: null,
            description: $"Total number of errors in {serviceName}");
    }
}
