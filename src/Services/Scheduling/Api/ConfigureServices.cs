using KDVManager.Services.Scheduling.Infrastructure;
using KDVManager.Shared.Infrastructure.Auth;
using KDVManager.Shared.Infrastructure.Http;
using KDVManager.Shared.Infrastructure.OpenApi;
using KDVManager.Shared.Infrastructure.Telemetry;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        const string serviceName = "scheduling-api";

        services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

        services.AddHttpContextAccessor();

        services.AddHealthChecks()
            .AddDbContextCheck<ApplicationDbContext>("postgres", tags: ["ready"]);

        services.AddControllers();
        // Query handlers (could consider MediatR later)
        services.AddScoped<KDVManager.Services.Scheduling.Application.Features.PrintSchedules.Queries.GetPrintSchedules.GetPrintSchedulesQueryHandler>();
        services.AddKdvManagerOpenApi("KDVManager Scheduling API");

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
