namespace KDVManager.Services.TenantManagement.Infrastructure.Identity;

/// <summary>
/// Configuration for the Auth0 Management API integration, bound from the
/// <c>Auth0</c> configuration section. When the client credentials are absent
/// (local/dev/e2e), a no-op provisioning service is used instead.
/// </summary>
public class Auth0ManagementOptions
{
    public string? Domain { get; set; }

    public string? ManagementClientId { get; set; }

    public string? ManagementClientSecret { get; set; }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(Domain)
        && !string.IsNullOrWhiteSpace(ManagementClientId)
        && !string.IsNullOrWhiteSpace(ManagementClientSecret);
}
