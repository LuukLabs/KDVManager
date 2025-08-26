using System.Diagnostics;
using OpenTelemetry;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Infrastructure.Tenancy;
using Microsoft.Extensions.Logging;

namespace KDVManager.Shared.Infrastructure.Telemetry;

/// <summary>
/// OpenTelemetry processor that enriches spans with tenant information
/// </summary>
public class TenantEnrichmentProcessor : BaseProcessor<Activity>
{
    private readonly ITenancyContextAccessor _tenancyContextAccessor;
    private readonly ILogger<TenantEnrichmentProcessor> _logger;

    public TenantEnrichmentProcessor(
        ITenancyContextAccessor tenancyContextAccessor,
        ILogger<TenantEnrichmentProcessor> logger)
    {
        _tenancyContextAccessor = tenancyContextAccessor;
        _logger = logger;
    }

    public override void OnStart(Activity data)
    {
        try
        {
            var tenantContext = _tenancyContextAccessor.Current;
            if (tenantContext != null)
            {
                data.SetTag("tenant.id", tenantContext.TenantId.ToString());
                _logger.LogDebug("Added tenant ID {TenantId} to span {SpanId}",
                    tenantContext.TenantId, data.Id);
            }
        }
        catch (TenantRequiredException)
        {
            // Tenant not available - this is expected for some requests like health checks
            _logger.LogDebug("No tenant context available for span {SpanId}", data.Id);
        }
        catch (Exception ex)
        {
            // Log but don't fail the request
            _logger.LogWarning(ex, "Failed to add tenant information to span {SpanId}", data.Id);
        }

        base.OnStart(data);
    }
}
