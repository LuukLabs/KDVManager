using System;
using KDVManager.Services.TenantManagement.Domain.Enums;

namespace KDVManager.Services.TenantManagement.Application.Features.Tenants;

/// <summary>The current user's tenant and their role within it.</summary>
public class TenantVM
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public TenantRole Role { get; set; }

    public DateTime TrialStartDate { get; set; }
}
