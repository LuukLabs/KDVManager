namespace KDVManager.Shared.Contracts.Tenancy;

/// <summary>
/// Well-known claim types used to carry tenant identity on authenticated requests.
/// </summary>
public static class TenancyClaimTypes
{
    /// <summary>
    /// The namespaced custom claim minted by the identity provider that carries the tenant id.
    /// </summary>
    public const string TenantId = "https://kdvmanager.nl/tenant";
}
