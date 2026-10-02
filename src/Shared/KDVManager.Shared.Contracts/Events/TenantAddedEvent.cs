using System;

namespace KDVManager.Shared.Contracts.Events;

/// <summary>
/// Event raised when a new tenant is provisioned in the system.
/// </summary>
public class TenantAddedEvent
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
}
