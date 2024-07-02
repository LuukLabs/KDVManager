using System;
using System.Collections.Generic;
public class ScheduleItem
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid ChildId { get; set; }
    public string Title { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public ICollection<RecurringSchedulePattern> recurringSchedulePatterns { get; set; }
}