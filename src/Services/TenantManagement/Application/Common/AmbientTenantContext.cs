using System;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.TenantManagement.Application.Common;

/// <summary>
/// Minimal <see cref="ITenancyContext"/> used to establish the ambient tenant
/// during provisioning — before the tenant claim exists on the token — so that
/// outgoing messages (e.g. <c>TenantRegisteredEvent</c>) carry the TenantId header.
/// </summary>
internal sealed class AmbientTenantContext : ITenancyContext
{
    public Guid TenantId { get; }

    public AmbientTenantContext(Guid tenantId) => TenantId = tenantId;
}
