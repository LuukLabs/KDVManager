using System;

namespace KDVManager.Services.Tenants.Application.Features.Tenants.Queries.GetTenantDetail
{
    public class TenantDetailVM
    {
        public Guid Id { get; set; }

        public required string Name { get; set; }

        public bool IsActive { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
    }
}
