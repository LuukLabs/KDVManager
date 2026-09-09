using System;

namespace KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.SetSubscription;

/// <summary>
/// Platform-admin command to convert a tenant to a subscription (trial → real)
/// or revert it back to trial.
/// </summary>
public class SetSubscriptionCommand
{
    public Guid TenantId { get; set; }

    /// <summary>True to convert to a subscription, false to revert to trial.</summary>
    public bool Subscribed { get; set; }
}
