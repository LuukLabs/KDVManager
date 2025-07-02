using System;
using System.ComponentModel.DataAnnotations;
using KDVManager.Services.Scheduling.Domain.Interfaces;

namespace KDVManager.Services.Scheduling.Domain.Entities;

public class ScheduleRule : IMustHaveTenant
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public DayOfWeek Day { get; set; }
    public Guid ScheduleId { get; set; }
    public Guid GroupId { get; set; }
    [Required]
    public Guid TimeSlotId { get; set; }
    public TimeSlot TimeSlot { get; set; }
    public Schedule Schedule { get; set; }
}