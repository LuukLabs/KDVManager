using System;
using KDVManager.Services.TenantManagement.Domain.Entities;
using KDVManager.Services.TenantManagement.Domain.Enums;
using KDVManager.Shared.Contracts.Trial;

namespace KDVManager.Services.TenantManagement.Application.Features.Admin;

/// <summary>A tenant as seen by a platform admin, with its derived trial state.</summary>
public class AdminTenantVM
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? InvoiceAddress { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime TrialStartDate { get; set; }
    public DateTime TrialEndDate { get; set; }
    public int DaysRemaining { get; set; }
    public bool IsExpired { get; set; }
    public bool IsSubscribed { get; set; }

    public static AdminTenantVM FromTenant(Tenant tenant)
    {
        var subscribed = tenant.SubscriptionStatus == SubscriptionStatus.Active;
        var trial = subscribed
            ? TrialStatus.Subscribed(tenant.TrialStartDate)
            : TrialStatus.FromStartDate(tenant.TrialStartDate);

        return new AdminTenantVM
        {
            Id = tenant.Id,
            Name = tenant.Name,
            InvoiceAddress = tenant.InvoiceAddress,
            CreatedAt = tenant.CreatedAt,
            TrialStartDate = trial.TrialStartDate,
            TrialEndDate = trial.TrialEndDate,
            DaysRemaining = trial.DaysRemaining,
            IsExpired = trial.IsExpired,
            IsSubscribed = trial.IsSubscribed,
        };
    }
}
