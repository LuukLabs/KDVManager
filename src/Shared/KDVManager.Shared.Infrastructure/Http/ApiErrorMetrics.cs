using System.Diagnostics.Metrics;

namespace KDVManager.Shared.Infrastructure.Http;

public sealed class ApiErrorMetrics : IDisposable
{
    private readonly Meter _meter;
    private readonly Counter<long> _errorCounter;

    public ApiErrorMetrics(string serviceName)
    {
        ServiceName = serviceName;
        _meter = new Meter(serviceName, "1.0.0");
        _errorCounter = _meter.CreateCounter<long>(
            $"{serviceName.Replace('-', '_')}_errors_total",
            $"Total number of errors in {serviceName}");
    }

    public string ServiceName { get; }
    public string MeterName => _meter.Name;

    public void Record(Exception exception)
    {
        _errorCounter.Add(1,
            new KeyValuePair<string, object?>("error_type", exception.GetType().Name),
            new KeyValuePair<string, object?>("service", ServiceName));
    }

    public void Dispose() => _meter.Dispose();
}
