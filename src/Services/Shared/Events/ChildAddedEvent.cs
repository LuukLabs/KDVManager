using System;

namespace KDVManager.Services.Shared.Events;

public class ChildAddedEvent
{
    public Guid ChildId { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public Guid TenantId { get; set; }
}
