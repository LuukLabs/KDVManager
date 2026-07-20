namespace KDVManager.Shared.Infrastructure.Hosting;

public sealed class KdvManagerApiOptions
{
    /// <summary>Service identity used for logging, telemetry and metric names (e.g. "crm-api").</summary>
    public required string ServiceName { get; init; }

    /// <summary>Title of the generated OpenAPI document (e.g. "KDVManager CRM API").</summary>
    public required string ApiTitle { get; init; }
}
