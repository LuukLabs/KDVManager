using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.Tenants.Application.Features.Tenants.Commands.AddTenant;

public class AddTenantCommand
{
    [property: Required]
    public string? Name { get; set; }
}
