namespace KDVManager.Shared.Contracts.Tenancy;

/// <summary>
/// Message headers used to propagate tenant information across the bus.
/// </summary>
public static class TenancyHeaders
{
    public const string TenantId = "TenantId";
}
