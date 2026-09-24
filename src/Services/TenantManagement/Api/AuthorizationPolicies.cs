namespace KDVManager.Services.TenantManagement.Api;

/// <summary>
/// Authorization policy names used by the TenantManagement API.
/// </summary>
public static class AuthorizationPolicies
{
    /// <summary>
    /// Cross-tenant platform administrator (superadmin). Requires the platform
    /// admin claim on the access token; see <c>deploy/auth0/README.md</c> for how
    /// a user is granted it.
    /// </summary>
    public const string PlatformAdmin = "PlatformAdmin";
}
