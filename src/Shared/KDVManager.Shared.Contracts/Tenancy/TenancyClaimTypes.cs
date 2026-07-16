namespace KDVManager.Shared.Contracts.Tenancy;

/// <summary>
/// Claim types used to carry tenant information in access tokens.
/// </summary>
public static class TenancyClaimTypes
{
    public const string TenantId = "https://kdvmanager.nl/tenant";

    /// <summary>
    /// Boolean claim marking a platform administrator (cross-tenant). Sourced from
    /// the user's <c>app_metadata.platform_admin</c> by the Auth0 post-login Action.
    /// </summary>
    public const string PlatformAdmin = "https://kdvmanager.nl/admin";
}
