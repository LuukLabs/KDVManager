namespace KDVManager.Services.TenantManagement.Application.Contracts.Identity;

/// <summary>
/// Exposes the authenticated identity (from the access token) for the current
/// request. Unlike the tenancy context, this is available before a tenant exists
/// — it is the identity used to provision and look up tenants.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>The identity provider subject (Auth0 <c>sub</c>), or null if unauthenticated.</summary>
    string? UserId { get; }

    /// <summary>The user's email, when present on the token.</summary>
    string? Email { get; }
}
