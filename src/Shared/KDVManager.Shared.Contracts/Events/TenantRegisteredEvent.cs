using System;

namespace KDVManager.Shared.Contracts.Events;

/// <summary>
/// Raised by the TenantManagement service the first time a tenant is seen, establishing the
/// start of its 30-day trial. Tenant information is passed via message headers.
/// Other services consume this to keep a local trial read model in sync.
/// </summary>
public class TenantRegisteredEvent
{
    public DateTime TrialStartDate { get; set; }
}
