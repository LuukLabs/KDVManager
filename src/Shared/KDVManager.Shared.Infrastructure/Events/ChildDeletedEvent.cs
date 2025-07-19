using System;

namespace KDVManager.Shared.Contracts.Events;

/// <summary>
/// Event raised when a child is deleted from the system
/// Tenant information is passed via message headers
/// </summary>
public class ChildDeletedEvent
{
    public Guid ChildId { get; set; }
}
