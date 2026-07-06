using System;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.CRM.Domain.Entities
{
    public class Administrator : IMustHaveTenant
    {
        public Guid Id { get; set; }

        public Guid TenantId { get; set; }

        public required string Auth0UserId { get; set; }

        public required string Name { get; set; }

        public required string Email { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
