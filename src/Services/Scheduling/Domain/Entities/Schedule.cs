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
    /// <summary>
    /// Calculated inclusive end date. Null means open-ended. Recalculated by domain logic (not set directly by consumers).
    /// </summary>
    public DateOnly? EndDate { get; private set; }
    public ICollection<ScheduleRule> ScheduleRules { get; set; } = new List<ScheduleRule>();

    internal void SetCalculatedEndDate(DateOnly? endDate) => EndDate = endDate;
}