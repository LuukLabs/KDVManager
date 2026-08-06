using System;

namespace KDVManager.Shared.Contracts.Events;

/// <summary>
/// Raised by the TenantManagement service when a tenant's trial is changed after
/// registration (e.g. a platform admin extends it). Like
/// <see cref="TenantRegisteredEvent"/>, the tenant id travels via the message's
/// TenantId header. Services holding a trial read model consume this to stay in
/// sync with the source of truth.
/// </summary>
public class TenantTrialChangedEvent
{
    public DateTime TrialStartDate { get; set; }

    /// <summary>True when the tenant has converted to a (paid) subscription.</summary>
    public bool IsSubscribed { get; set; }
}
