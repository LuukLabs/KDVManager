using KDVManager.Shared.Infrastructure.Auth;
using KDVManager.Shared.Infrastructure.Http;
using KDVManager.Shared.Infrastructure.Logging;
using KDVManager.Shared.Infrastructure.Middleware;
using KDVManager.Shared.Infrastructure.OpenApi;
using KDVManager.Shared.Infrastructure.Telemetry;
using KDVManager.Shared.Infrastructure.Tenancy;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace KDVManager.Shared.Infrastructure.Hosting;

/// <summary>
/// Default host composition for KDVManager APIs. Bundles the registrations and the
/// request pipeline that every service shares; each ingredient remains an individual
/// public extension, so a service that needs to diverge can compose manually.
/// </summary>
public static class KdvManagerApiExtensions
{
    /// <summary>
    /// Registers the shared API defaults: lowercase routing, HttpContextAccessor,
    /// a "postgres" readiness check on <typeparamref name="TDbContext"/>, OpenAPI,
    /// authentication, correlation-id propagation for outgoing HTTP, per-service
    /// metrics, telemetry and structured logging.
    /// </summary>
    public static WebApplicationBuilder AddKdvManagerApi<TDbContext>(this WebApplicationBuilder builder, KdvManagerApiOptions options)
        where TDbContext : DbContext
    {
        var services = builder.Services;
        var configuration = builder.Configuration;

        services.Configure<RouteOptions>(routeOptions => routeOptions.LowercaseUrls = true);

        services.AddHttpContextAccessor();

        services.AddHealthChecks()
            .AddDbContextCheck<TDbContext>("postgres", tags: ["ready"]);

        services.AddKdvManagerOpenApi(options.ApiTitle);

        services.AddKdvManagerAuthentication(configuration);

        // Outgoing HTTP correlation propagation
        services.AddTransient<CorrelationIdPropagationHandler>();
        services.AddHttpClient("default")
            .AddHttpMessageHandler<CorrelationIdPropagationHandler>();

        var apiMetrics = new ApiMetrics(options.ServiceName);
        services.AddSingleton(apiMetrics);

        services.AddKdvManagerTelemetry(configuration, options.ServiceName, apiMetrics.Meter.Name);

        // Structured production logging (stdout JSON + OTLP if endpoint present)
        builder.Logging.AddKdvManagerLogging(configuration, options.ServiceName);

        return builder;
    }

    /// <summary>
    /// The shared request pipeline: OpenAPI endpoint in development, routing, exception
    /// handling, authentication/authorization, correlation-id and tenancy middleware,
    /// and the liveness/readiness health endpoints. Map service endpoints after this.
    /// </summary>
    public static WebApplication UseKdvManagerApi(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi().AllowAnonymous();
        }

        app.UseRouting();

        app.UseCustomExceptionHandler();

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseMiddleware<CorrelationIdMiddleware>();
        app.UseTenancy();

        // Liveness: process-up only; readiness: all registered checks (postgres, MassTransit bus)
        app.MapHealthChecks("/healthz", new HealthCheckOptions { Predicate = _ => false }).AllowAnonymous();
        app.MapHealthChecks("/readyz").AllowAnonymous();

        return app;
    }
}
