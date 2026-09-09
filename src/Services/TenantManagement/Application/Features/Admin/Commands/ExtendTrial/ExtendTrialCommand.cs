using System;

namespace KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.ExtendTrial;

/// <summary>Platform-admin command to extend a tenant's trial.</summary>
public class ExtendTrialCommand
{
    public Guid TenantId { get; set; }

    /// <summary>
    /// Days to extend by, counted from the current trial end — or from now when the
    /// trial has already expired (so an expired tenant gets the full extension).
    /// </summary>
    public int Days { get; set; }
}
