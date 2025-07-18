using System;
using KDVManager.Shared.Domain.Tenancy;

namespace KDVManager.Shared.Infrastructure.Tenancy;

/// <summary>
/// Implementation of tenant context for MassTransit consumers
/// Stores tenant information for the current scope/request
/// </summary>
public class TenantContext : ITenantContext
{
    private Guid? _tenantId;

    public Guid? TenantId => _tenantId;

    public bool HasTenant => _tenantId.HasValue && _tenantId.Value != Guid.Empty;

    public void SetTenant(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
        {
            throw new ArgumentException("Tenant ID cannot be empty", nameof(tenantId));
        }

        _tenantId = tenantId;
    }

    public void ClearTenant()
    {
        _tenantId = null;
    }
}
