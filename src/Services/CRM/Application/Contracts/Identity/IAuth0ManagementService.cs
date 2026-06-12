using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace KDVManager.Services.CRM.Application.Contracts.Identity;

/// <summary>
/// Thin abstraction over the Auth0 Management API for administrator management.
/// All organization-scoped operations are constrained by the caller to the current
/// tenant's organization id (see <see cref="IOrganizationContext"/>).
/// </summary>
public interface IAuth0ManagementService
{
    Task<IReadOnlyList<Auth0OrganizationMember>> GetOrganizationMembersAsync(string organizationId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Auth0OrganizationInvitation>> GetPendingInvitationsAsync(string organizationId, CancellationToken cancellationToken = default);

    Task CreateInvitationAsync(string organizationId, string inviterName, string inviteeEmail, CancellationToken cancellationToken = default);

    Task<bool> IsMemberOfOrganizationAsync(string organizationId, string userId, CancellationToken cancellationToken = default);

    /// <summary>Permanently deletes the Auth0 user account.</summary>
    Task DeleteUserAsync(string userId, CancellationToken cancellationToken = default);

    Task DeleteInvitationAsync(string organizationId, string invitationId, CancellationToken cancellationToken = default);
}

public record Auth0OrganizationMember(string UserId, string? Email, string? Name, string? Picture);

public record Auth0OrganizationInvitation(string Id, string? InviteeEmail, string? InviterName, DateTimeOffset? CreatedAt, DateTimeOffset? ExpiresAt);
