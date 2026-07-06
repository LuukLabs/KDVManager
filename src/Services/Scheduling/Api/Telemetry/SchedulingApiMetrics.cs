using System.Diagnostics.Metrics;

namespace KDVManager.Services.Scheduling.Api.Telemetry;

public static class SchedulingApiMetrics
{
    public static readonly Meter Meter = new("scheduling-api", "1.0.0");

    public static readonly Counter<long> ErrorCounter = Meter.CreateCounter<long>(
        "scheduling_api_errors_total",
        "Total number of errors in Scheduling API");
}
