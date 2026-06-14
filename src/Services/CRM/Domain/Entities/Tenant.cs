using System;

namespace KDVManager.Services.CRM.Domain.Entities
{
    /// <summary>
    /// A tenant of the platform. The CRM service is the source of truth for the
    /// tenant's 30-day trial. <see cref="Id"/> matches the tenant identifier from
    /// the authentication token.
    /// </summary>
    public class Tenant
    {
        public Guid Id { get; set; }

        /// <summary>UTC moment the trial started (when the tenant was first seen).</summary>
        public DateTime TrialStartDate { get; set; }

        /// <summary>UTC moment the tenant record was created.</summary>
        public DateTime CreatedAt { get; set; }
    }
}
