using System;
using KDVManager.Services.Scheduling.Domain.Interfaces;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.Scheduling.Domain.Entities;

public class Absence : IMustHaveTenant
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid ChildId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string? Reason { get; set; }
}
