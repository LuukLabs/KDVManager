using System;
using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.Tenants.Application.Features.Tenants.Queries.GetTenantList
{
    public class TenantListVM
    {
        [property: Required]
        public required Guid Id { get; set; }

        [property: Required]
        public required string Name { get; set; }

        [property: Required]
        public required bool IsActive { get; set; }

        [property: Required]
        public required DateTimeOffset CreatedAt { get; set; }
    }
}
