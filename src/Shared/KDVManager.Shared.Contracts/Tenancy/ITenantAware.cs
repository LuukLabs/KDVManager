using System;

namespace KDVManager.Shared.Contracts.Tenancy;

/// <summary>
/// Interface for objects that are tenant-aware
/// </summary>
public interface ITenantAware
{
    /// <summary>
    /// The tenant ID this object belongs to
    /// </summary>
    Guid TenantId { get; }
}
