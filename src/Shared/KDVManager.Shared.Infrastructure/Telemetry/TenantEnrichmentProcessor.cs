using System.Diagnostics;
using KDVManager.Shared.Contracts.Tenancy;
using OpenTelemetry;

namespace KDVManager.Shared.Infrastructure.Telemetry;

/// <summary>
/// Stamps tenant.id on every span started while a tenant context is resolved, so child
/// spans (database, HttpClient, MassTransit publish) carry the tenant like the server span.
/// </summary>
public class TenantEnrichmentProcessor : BaseProcessor<Activity>
{
    private readonly ITenancyContextAccessor _tenancyContextAccessor;

    public TenantEnrichmentProcessor(ITenancyContextAccessor tenancyContextAccessor)
    {
        _tenancyContextAccessor = tenancyContextAccessor;
    }

    public override void OnStart(Activity data)
    {
        // No tenant is expected for spans outside a tenant flow (health checks, startup).
        if (_tenancyContextAccessor.HasTenant)
        {
            data.SetTag("tenant.id", _tenancyContextAccessor.Current!.TenantId.ToString());
        }
    }
}
