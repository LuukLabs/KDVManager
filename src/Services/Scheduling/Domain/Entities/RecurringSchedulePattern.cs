using System;
using System.ComponentModel.DataAnnotations;
using KDVManager.Services.Scheduling.Domain.Interfaces;

public class RecurringSchedulePattern : IMustHaveTenant
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid ScheduleItemId { get; set; }
    public DayOfWeek Day { get; set; }

    [Required]
    public Guid TimeSlotId { get; set; }
}