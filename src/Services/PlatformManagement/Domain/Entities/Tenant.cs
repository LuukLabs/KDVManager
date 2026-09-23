using System;

namespace KDVManager.Services.PlatformManagement.Domain.Entities;

/// <summary>
/// A tenant of the KDVManager platform. This is the platform-level aggregate;
/// it intentionally does not implement IMustHaveTenant.
/// </summary>
public class Tenant
{
    public Guid Id { get; set; }

    public required string Name { get; set; }
}
