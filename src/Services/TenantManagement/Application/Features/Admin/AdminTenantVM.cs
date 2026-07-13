using System;

namespace KDVManager.Services.TenantManagement.Application.Features.Admin;

/// <summary>A tenant as seen by a platform admin, with its derived trial state.</summary>
public class AdminTenantVM
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime TrialStartDate { get; set; }
    public DateTime TrialEndDate { get; set; }
    public int DaysRemaining { get; set; }
    public bool IsExpired { get; set; }
}
