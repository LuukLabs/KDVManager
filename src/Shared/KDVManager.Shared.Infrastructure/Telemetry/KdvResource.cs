using System.Reflection;
using Microsoft.Extensions.Configuration;
using OpenTelemetry.Resources;

namespace KDVManager.Shared.Infrastructure.Telemetry;

internal static class KdvResource
{
    private const string ServiceNamespace = "KDVManager";

    private static readonly string InstanceId =
        Environment.GetEnvironmentVariable("SERVICE_INSTANCE_ID") ?? Guid.NewGuid().ToString();

    internal static ResourceBuilder Configure(ResourceBuilder builder, IConfiguration configuration, string serviceName)
    {
        return builder
            .AddService(
                serviceName: serviceName,
                serviceNamespace: ServiceNamespace,
                serviceVersion: GetVersion(),
                serviceInstanceId: InstanceId)
            .AddAttributes(new KeyValuePair<string, object>[]
            {
                new("deployment.environment", configuration["ASPNETCORE_ENVIRONMENT"] ?? "Production"),
                new("host.name", Environment.MachineName)
            });
    }

    private static string GetVersion()
    {
        try
        {
            var assembly = Assembly.GetEntryAssembly() ?? typeof(KdvResource).Assembly;
            return assembly.GetName().Version?.ToString() ?? "unknown";
        }
        catch
        {
            return "unknown";
        }
    }
}
