using System;

namespace KDVManager.Services.Tenants.Domain.Entities
{
    public class Tenant
    {
        public Guid Id { get; set; }

        public required string Name { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTimeOffset CreatedAt { get; set; }
    }
}
