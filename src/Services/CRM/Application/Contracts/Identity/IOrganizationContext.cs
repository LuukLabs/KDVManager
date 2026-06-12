namespace KDVManager.Services.CRM.Application.Contracts.Identity;

/// <summary>
/// Provides access to the Auth0 organization (tenant) and user that the current
/// request is authenticated against. Values are derived from the validated JWT
/// (the <c>org_id</c> and <c>sub</c> claims) and must never be supplied by the client.
/// </summary>
public interface IOrganizationContext
{
    /// <summary>The Auth0 organization id (org_...) for the current tenant.</summary>
    string OrganizationId { get; }

    /// <summary>The Auth0 user id (sub) of the currently authenticated administrator.</summary>
    string CurrentUserId { get; }

    /// <summary>
    /// A human-friendly name for the current administrator (from the <c>name</c> or
    /// <c>email</c> claim), used e.g. as the inviter name on invitations. Falls back to
    /// "KDVManager" when no name-like claim is present on the token.
    /// </summary>
    string CurrentUserName { get; }
}
