using System;

namespace KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.DeleteTenant;

/// <summary>Platform-admin command to delete a tenant and its memberships.</summary>
public class DeleteTenantCommand
{
    public Guid TenantId { get; set; }
}
