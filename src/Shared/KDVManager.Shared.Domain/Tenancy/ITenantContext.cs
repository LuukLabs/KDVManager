using System;

namespace KDVManager.Shared.Domain.Tenancy;

/// <summary>
/// Represents the tenant context for the current scope/request
/// Used to store and retrieve tenant information in MassTransit consumers
/// </summary>
public interface ITenantContext
{
    /// <summary>
    /// Gets the current tenant ID if set
    /// </summary>
    Guid? TenantId { get; }

    /// <summary>
    /// Indicates whether a tenant is currently set in this context
    /// </summary>
    bool HasTenant { get; }

    /// <summary>
    /// Sets the tenant ID for the current context
    /// This should only be called by infrastructure (middleware)
    /// </summary>
    void SetTenant(Guid tenantId);

    /// <summary>
    /// Clears the tenant from the current context
    /// </summary>
    void ClearTenant();
}
