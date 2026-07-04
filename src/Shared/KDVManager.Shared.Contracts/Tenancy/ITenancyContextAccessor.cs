namespace KDVManager.Shared.Contracts.Tenancy;

public interface ITenancyContextAccessor
{
    /// <summary>
    /// The current tenant context. Reading it while no tenant is resolved fails closed.
    /// </summary>
    ITenancyContext? Current { get; set; }

    /// <summary>
    /// Whether a tenant context has been resolved. Safe to read at any time.
    /// </summary>
    bool HasTenant { get; }
}
