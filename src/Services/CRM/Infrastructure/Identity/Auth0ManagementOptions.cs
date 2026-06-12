namespace KDVManager.Services.CRM.Infrastructure.Identity;

/// <summary>
/// Configuration for calling the Auth0 Management API. Bound from the "Auth0" section.
/// The client id/secret belong to a Machine-to-Machine application authorized for the
/// Management API; secrets must be provided via environment/user-secrets, not source.
/// </summary>
public class Auth0ManagementOptions
{
    public const string SectionName = "Auth0";

    /// <summary>Auth0 tenant domain, e.g. "kdvmanager.eu.auth0.com".</summary>
    public string Domain { get; set; } = string.Empty;

    /// <summary>Client id of the M2M application authorized for the Management API.</summary>
    public string ManagementClientId { get; set; } = string.Empty;

    /// <summary>Client secret of the M2M application authorized for the Management API.</summary>
    public string ManagementClientSecret { get; set; } = string.Empty;

    /// <summary>
    /// Client id of the application invited users are directed to when accepting an
    /// invitation (the SPA application).
    /// </summary>
    public string InvitationClientId { get; set; } = string.Empty;

    /// <summary>
    /// Optional Auth0 database connection id to associate invitations with. When empty,
    /// Auth0 uses the organization's enabled connections.
    /// </summary>
    public string? InvitationConnectionId { get; set; }
}
