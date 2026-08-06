using System;
using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.Tenants.Application.Features.Tenants.Commands.UpdateTenant
{
    public class UpdateTenantCommand
    {
        [property: Required]
        public Guid Id { get; set; }

        [property: Required]
        public string? Name { get; set; }
    }
}
