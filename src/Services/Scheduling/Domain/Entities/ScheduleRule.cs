using System;
using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.Scheduling.Domain.Entities;

public class ScheduleRule
{
    public Guid Id { get; set; }
    public DayOfWeek Day { get; set; }
    public Guid ScheduleId { get; set; }
    [Required]
    public Guid TimeSlotId { get; set; }
}