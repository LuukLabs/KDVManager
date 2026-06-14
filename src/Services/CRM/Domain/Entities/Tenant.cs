using System;

namespace KDVManager.Services.CRM.Domain.Entities;

/// <summary>
/// Local read model of a tenant's trial, kept in sync with the TenantManagement
/// service (the source of truth) via <c>TenantRegisteredEvent</c>. <see cref="Id"/> matches the
/// tenant identifier from the authentication token.
/// </summary>
public class Tenant
{
    public Guid Id { get; set; }

    /// <summary>UTC moment the trial started.</summary>
    public DateTime TrialStartDate { get; set; }
}
