using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.TenantManagement.Application.Contracts.Identity;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.TenantManagement.Infrastructure.Identity;

/// <summary>
/// No-op identity provisioning used when the Auth0 Management API is not configured
/// (local development and e2e). The tenant is still created in the database; only the
/// identity-provider write is skipped.
/// </summary>
public class NullIdentityProvisioningService : IIdentityProvisioningService
{
    private readonly ILogger<NullIdentityProvisioningService> _logger;

    public NullIdentityProvisioningService(ILogger<NullIdentityProvisioningService> logger)
    {
        _logger = logger;
    }

    public Task SetTenantAsync(string userId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        _logger.LogWarning(
            "Auth0 Management API not configured; skipping app_metadata update (user {UserId} -> tenant {TenantId}).",
            userId, tenantId);
        return Task.CompletedTask;
    }
}
