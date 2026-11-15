using System;
using System.Threading;
using System.Threading.Tasks;

namespace KDVManager.Services.TenantManagement.Application.Contracts.Identity;

/// <summary>
/// Propagates the app-owned tenant id to the identity provider so it is carried
/// on the user's future access tokens (as the tenant claim). For Auth0 this writes
/// <c>app_metadata.tenant_id</c> on the user.
/// </summary>
public interface IIdentityProvisioningService
{
    Task SetTenantAsync(string userId, Guid tenantId, CancellationToken cancellationToken = default);
}
