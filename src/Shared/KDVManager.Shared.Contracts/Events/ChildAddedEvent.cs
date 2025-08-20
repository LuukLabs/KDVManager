using System;

namespace KDVManager.Shared.Contracts.Events;

/// <summary>
/// Event raised when a child is added to the system
/// Tenant information is passed via message headers
/// </summary>
public class ChildAddedEvent
{
    public Guid ChildId { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public string GivenName { get; set; } = string.Empty;
    public string FamilyName { get; set; } = string.Empty;
}
