using MassTransit.Logging;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Infrastructure.Http;
using KDVManager.Services.TenantManagement.Api;
using KDVManager.Services.TenantManagement.Api.Services;
using KDVManager.Services.TenantManagement.Application.Contracts.Identity;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

        services.AddHttpContextAccessor();

        services.AddScoped<ICurrentUserService, CurrentUserService>();

        services.AddHealthChecks();

        services.AddOpenApi(options =>
        {
            options.OpenApiVersion = Microsoft.OpenApi.OpenApiSpecVersion.OpenApi3_0;

            options.AddDocumentTransformer((document, context, cancellationToken) =>
            {
                document.Info = new()
                {
                    Title = "KDVManager TenantManagement API",
                    Version = "v1",
                    Contact = new()
                    {
                        Name = "Luuk van Hulten",
                        Email = "admin@kdvmanager.nl"
                    }
                };
                return Task.CompletedTask;
            });
            options.AddSchemaTransformer((schema, context, cancellationToken) =>
            {
                if (schema.Properties != null)
                {
                    var newProperties = schema.Properties.ToDictionary(
                        prop => Char.ToLowerInvariant(prop.Key[0]) + prop.Key.Substring(1),
                        prop => prop.Value
                    );
                    schema.Properties = newProperties;
                }
                // ASP.NET Core 9 OpenAPI emits a `pattern` on integer fields and omits the `type`,
                // which causes Orval to generate `unknown` instead of `number`. Fix both.
                if (schema.Format == "int32" || schema.Format == "int64")
                {
                    schema.Pattern = null;
                    schema.Type = JsonSchemaType.Integer;
                }
                return Task.CompletedTask;
            });
            options.AddOperationTransformer((operation, context, cancellationToken) =>
            {
                if (operation.Parameters != null)
                {
                    foreach (var parameter in operation.Parameters)
                    {
                        if (parameter is OpenApiParameter p)
                        {
                            p.Name = Char.ToLowerInvariant(p.Name[0]) + p.Name[1..];
                        }
                    }
                }

                return Task.CompletedTask;
            });
        });

        // Auth0:Authority overrides the Auth0:Domain-derived authority (lets e2e tests point at a local mock issuer)
        string authority = configuration["Auth0:Authority"] ?? $"https://{configuration["Auth0:Domain"]}/";
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                    .AddJwtBearer(options =>
                    {
                        options.Authority = authority;
                        options.Audience = configuration["Auth0:Audience"];
                        options.RequireHttpsMetadata = authority.StartsWith("https://", StringComparison.OrdinalIgnoreCase);
                    });
        services.AddAuthorization(options =>
        {
            // Cross-tenant platform administrator; the claim is minted by the Auth0
            // post-login Action from app_metadata.platform_admin (see deploy/auth0).
            options.AddPolicy(AuthorizationPolicies.PlatformAdmin, policy =>
                policy.RequireClaim(TenancyClaimTypes.PlatformAdmin, "true"));
        });

        // Outgoing HTTP correlation propagation
        services.AddTransient<CorrelationIdPropagationHandler>();
        services.AddHttpClient("default")
            .AddHttpMessageHandler<CorrelationIdPropagationHandler>();

        var otel = services.AddOpenTelemetry();
        var otelEndpoint = configuration["Otel:Endpoint"];
        otel.ConfigureResource(resource => resource.AddService(serviceName: "tenantmanagement-api"));

        otel.WithTracing(tracing =>
                {
                    // Configurable sampling ratio (default 1.0 = always sample). Supports config key Otel:TraceSamplingRatio or env OTEL_TRACE_SAMPLING_RATIO.
                    var ratio = configuration.GetValue<double?>("Otel:TraceSamplingRatio");
                    if (ratio is null)
                    {
                        var envRatio = Environment.GetEnvironmentVariable("OTEL_TRACE_SAMPLING_RATIO");
                        if (double.TryParse(envRatio, out var parsed)) ratio = parsed;
                    }
                    ratio ??= 1.0d;
                    ratio = Math.Clamp(ratio.Value, 0d, 1d);

                    tracing.SetSampler(new ParentBasedSampler(new TraceIdRatioBasedSampler(ratio.Value)));
                    tracing
                        .AddAspNetCoreInstrumentation(options =>
                        {
                            options.RecordException = true;
                        })
                        .AddHttpClientInstrumentation(options =>
                        {
                            options.RecordException = true;
                        })
                        .AddSource(DiagnosticHeaders.DefaultListenerName);

                    if (!string.IsNullOrWhiteSpace(otelEndpoint))
                    {
                        tracing.AddOtlpExporter(options =>
                        {
                            options.Endpoint = new Uri(otelEndpoint);
                        });
                    }
                });

        otel.WithMetrics(metrics =>
            {
                metrics
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddRuntimeInstrumentation();

                if (!string.IsNullOrWhiteSpace(otelEndpoint))
                {
                    metrics.AddOtlpExporter(options =>
                    {
                        options.Endpoint = new Uri(otelEndpoint);
                    });
                }
            });


        return services;
    }
}
