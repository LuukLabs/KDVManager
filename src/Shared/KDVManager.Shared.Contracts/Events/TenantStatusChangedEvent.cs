using System;

namespace KDVManager.Shared.Contracts.Events;

/// <summary>
/// Event raised when a tenant is activated or deactivated. Other services can
/// consume this to, for example, reject writes for a deactivated tenant.
/// </summary>
public class TenantStatusChangedEvent
{
    public Guid TenantId { get; set; }
    public bool IsActive { get; set; }
}
