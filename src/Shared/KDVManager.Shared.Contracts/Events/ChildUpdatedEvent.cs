using System;

namespace KDVManager.Shared.Contracts.Events;

/// <summary>
/// Event raised when a child is updated in the system
/// Tenant information is passed via message headers
/// </summary>
public class ChildUpdatedEvent
{
    public Guid ChildId { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public string GivenName { get; set; } = string.Empty;
    public string FamilyName { get; set; } = string.Empty;
}
