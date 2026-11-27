using System;
using KDVManager.Services.TenantManagement.Domain.Enums;

namespace KDVManager.Services.TenantManagement.Domain.Entities
{
    /// <summary>
    /// Links an authenticated identity (the Auth0 <c>sub</c>) to a <see cref="Tenant"/>
    /// with a role. This is the app-owned user-to-tenant relationship; an org may
    /// have many memberships.
    /// </summary>
    public class Membership
    {
        public Guid Id { get; set; }

        public Guid TenantId { get; set; }

        /// <summary>The identity provider subject (Auth0 <c>sub</c>) of the user.</summary>
        public string UserId { get; set; } = string.Empty;

        public TenantRole Role { get; set; }

        /// <summary>UTC moment the membership was created.</summary>
        public DateTime CreatedAt { get; set; }
    }
}
