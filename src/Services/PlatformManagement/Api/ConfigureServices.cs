using KDVManager.Services.PlatformManagement.Api.Telemetry;
using KDVManager.Services.PlatformManagement.Infrastructure;
using KDVManager.Shared.Infrastructure.Auth;
using KDVManager.Shared.Infrastructure.Http;
using KDVManager.Shared.Infrastructure.OpenApi;
using KDVManager.Shared.Infrastructure.Telemetry;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

        services.AddHttpContextAccessor();

        services.AddHealthChecks()
            .AddDbContextCheck<ApplicationDbContext>("postgres", tags: ["ready"]);

        services.AddKdvManagerOpenApi("KDVManager Platform Management API");

        services.AddKdvManagerAuthentication(configuration);

        // Outgoing HTTP correlation propagation
        services.AddTransient<CorrelationIdPropagationHandler>();
        services.AddHttpClient("default")
            .AddHttpMessageHandler<CorrelationIdPropagationHandler>();

        services.AddKdvManagerTelemetry(configuration, "platformmanagement-api", PlatformManagementApiMetrics.Meter.Name);

        return services;
    }
}
