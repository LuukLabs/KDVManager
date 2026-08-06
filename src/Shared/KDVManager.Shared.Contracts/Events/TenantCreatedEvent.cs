using System;

namespace KDVManager.Shared.Contracts.Events;

/// <summary>
/// Event raised when a tenant is created on the platform.
/// This is a platform-level event; the tenant is identified in the body instead of message headers.
/// </summary>
public class TenantCreatedEvent
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
}
