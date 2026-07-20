using KDVManager.Services.CRM.Infrastructure;
using KDVManager.Shared.Infrastructure.Auth;
using KDVManager.Shared.Infrastructure.Http;
using KDVManager.Shared.Infrastructure.OpenApi;
using KDVManager.Shared.Infrastructure.Telemetry;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        const string serviceName = "crm-api";

        services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

        services.AddHttpContextAccessor();

        services.AddHealthChecks()
            .AddDbContextCheck<ApplicationDbContext>("postgres", tags: ["ready"]);

        services.AddKdvManagerOpenApi("KDVManager CRM API");

        services.AddKdvManagerAuthentication(configuration);
        services.AddKdvManagerExceptionHandling(serviceName);

        // Outgoing HTTP correlation propagation
        services.AddTransient<CorrelationIdPropagationHandler>();
        services.AddHttpClient("default")
            .AddHttpMessageHandler<CorrelationIdPropagationHandler>();

        services.AddKdvManagerTelemetry(configuration, serviceName, serviceName);

        return services;
    }
}
