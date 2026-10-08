using System;

namespace KDVManager.Shared.Contracts.Events;

/// <summary>
/// Event raised when a tenant is deleted from the platform.
/// This is a platform-level event; the tenant is identified in the body instead of message headers.
/// </summary>
public class TenantDeletedEvent
{
    public Guid TenantId { get; set; }
}
