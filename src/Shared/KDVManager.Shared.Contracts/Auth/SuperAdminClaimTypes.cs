namespace KDVManager.Shared.Contracts.Auth;

/// <summary>
/// Claim types used to identify platform super-admins — callers who manage
/// tenants themselves and therefore operate above any single tenant's scope.
/// </summary>
public static class SuperAdminClaimTypes
{
    public const string Role = "https://kdvmanager.nl/roles";
    public const string SuperAdminValue = "superadmin";
}
