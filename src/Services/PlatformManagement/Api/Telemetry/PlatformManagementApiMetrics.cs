using System.Diagnostics.Metrics;

namespace KDVManager.Services.PlatformManagement.Api.Telemetry;

public static class PlatformManagementApiMetrics
{
    public static readonly Meter Meter = new("platformmanagement-api", "1.0.0");

    public static readonly Counter<long> ErrorCounter = Meter.CreateCounter<long>(
        "platformmanagement_api_errors_total",
        "Total number of errors in Platform Management API");
}
