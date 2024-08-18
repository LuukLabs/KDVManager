using System;
using System.Collections.Generic;
using KDVManager.Services.Scheduling.Domain.Interfaces;

public class ScheduleItem : IMustHaveTenant
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid ChildId { get; set; }
    public Guid GroupId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public ICollection<RecurringSchedulePattern> recurringSchedulePatterns { get; set; }
}