using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Trace;
using KDVManager.Shared.Infrastructure.Tenancy;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Shared.Infrastructure.Tracing;

/// <summary>
/// Adds tenant.id tag to activities if available from tenancy context accessor.
/// </summary>
public class TenantEnricherActivityProcessor : BaseProcessor<Activity>
{
    private readonly ITenancyContextAccessor _tenancyAccessor;

    public TenantEnricherActivityProcessor(ITenancyContextAccessor tenancyAccessor)
    {
        _tenancyAccessor = tenancyAccessor;
    }

    public override void OnStart(Activity data)
    {
        var tenant = _tenancyAccessor.Current;
        if (tenant != null)
        {
            data.SetTag("tenant.id", tenant.TenantId.ToString());
        }
    }
}
