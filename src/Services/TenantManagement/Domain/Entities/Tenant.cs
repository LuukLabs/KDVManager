using System;

namespace KDVManager.Services.TenantManagement.Domain.Entities
{
    /// <summary>
    /// A tenant (organization) of the platform. The TenantManagement service is
    /// the source of truth for the tenant: it mints <see cref="Id"/> at
    /// provisioning time and owns the 30-day trial. The id is then propagated to
    /// the identity provider so it appears as the tenant claim on the access token.
    /// </summary>
    public class Tenant
    {
        public Guid Id { get; set; }

        /// <summary>Organization display name, supplied during onboarding.</summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>Billing address used on invoices; empty until an admin fills it in.</summary>
        public string? InvoiceAddress { get; set; }

        /// <summary>UTC moment the trial started (when the tenant was provisioned).</summary>
        public DateTime TrialStartDate { get; set; }

        /// <summary>
        /// Commercial state; <see cref="Enums.SubscriptionStatus.Active"/> tenants
        /// are exempt from trial expiry.
        /// </summary>
        public Enums.SubscriptionStatus SubscriptionStatus { get; set; }

        /// <summary>UTC moment the tenant record was created.</summary>
        public DateTime CreatedAt { get; set; }
    }
}
