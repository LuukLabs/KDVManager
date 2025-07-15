using System;

namespace KDVManager.Services.Shared.Events;

public class ChildCreatedEvent
{
    public Guid ChildId { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public Guid TenantId { get; set; }
}
