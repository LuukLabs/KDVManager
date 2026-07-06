using System;
using System.Threading;
using System.Threading.Tasks;

namespace KDVManager.Services.CRM.Application.Contracts.Services;

public interface IAuth0ManagementService
{
    /// <summary>
    /// Creates a login-capable Auth0 user tagged with the given tenant and triggers
    /// Auth0's password-reset email so the user sets their own password.
    /// </summary>
    /// <returns>The Auth0 user id (e.g. "auth0|abc123").</returns>
    Task<string> CreateUserAsync(string email, string name, Guid tenantId, CancellationToken cancellationToken = default);

    Task DeleteUserAsync(string auth0UserId, CancellationToken cancellationToken = default);
}
