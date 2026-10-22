using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.PlatformManagement.Application.Features.Tenants.Commands.CreateTenant;

public class CreateTenantCommand
{
    [property: Required]
    public string? Name { get; set; }
}
