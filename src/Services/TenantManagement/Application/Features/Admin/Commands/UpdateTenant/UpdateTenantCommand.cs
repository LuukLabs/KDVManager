using System;

namespace KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.UpdateTenant;

/// <summary>Platform-admin command to change a tenant's organization details.</summary>
public class UpdateTenantCommand
{
    public Guid TenantId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? InvoiceAddress { get; set; }
}
