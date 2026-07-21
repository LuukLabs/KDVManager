using KDVManager.Shared.Infrastructure.Telemetry;
using Xunit;

namespace KDVManager.UnitTests.Shared;

public class ApiMetricsTests
{
    [Fact]
    public void Meter_and_counter_names_derive_from_the_service_name()
    {
        var apiMetrics = new ApiMetrics("scheduling-api");

        Assert.Equal("scheduling-api", apiMetrics.ServiceName);
        Assert.Equal("scheduling-api", apiMetrics.Meter.Name);
        Assert.Equal("scheduling_api_errors_total", apiMetrics.ErrorCounter.Name);
    }
}
