using System;

namespace KDVManager.Services.Scheduling.Domain.Events;

/// <summary>
/// Raised when a child reaches a specific age in whole years (on the birthday date).
/// </summary>
public record ChildTurnedAgeDomainEvent(Guid ChildId, Guid TenantId, int Age, DateOnly BirthdayDate);
