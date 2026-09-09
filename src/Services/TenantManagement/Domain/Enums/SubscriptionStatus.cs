namespace KDVManager.Services.TenantManagement.Domain.Enums
{
    /// <summary>Commercial state of a tenant.</summary>
    public enum SubscriptionStatus
    {
        /// <summary>In the (possibly extended) 30-day trial; expires.</summary>
        Trial = 0,

        /// <summary>Converted to a subscription; never expires.</summary>
        Active = 1,
    }
}
