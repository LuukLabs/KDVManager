using System;
using KDVManager.Services.Scheduling.Domain.Interfaces;

public class RecurringSchedulePattern : IMustHaveTenant
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid ScheduleItemId { get; set; }
    public DayOfWeek Day { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}