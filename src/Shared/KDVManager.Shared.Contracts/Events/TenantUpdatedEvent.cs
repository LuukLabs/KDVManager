using System;

namespace KDVManager.Shared.Contracts.Events;

/// <summary>
/// Event raised when a tenant's details are updated.
/// </summary>
public class TenantUpdatedEvent
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
}
