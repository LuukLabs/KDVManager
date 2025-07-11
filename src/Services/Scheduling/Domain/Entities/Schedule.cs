using System;
using System.Collections.Generic;
using KDVManager.Services.Scheduling.Domain.Interfaces;

namespace KDVManager.Services.Scheduling.Domain.Entities;

public class Schedule : IMustHaveTenant
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid ChildId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public ICollection<ScheduleRule> ScheduleRules { get; set; }
}