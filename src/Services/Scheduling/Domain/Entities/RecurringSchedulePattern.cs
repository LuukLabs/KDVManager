using System;
public class RecurringSchedulePattern
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid ScheduleItemId { get; set; }
    public DayOfWeek StartDay { get; set; }
    public TimeSpan StartTime { get; set; }
    public DayOfWeek EndDay { get; set; }
    public TimeSpan EndTime { get; set; }
}