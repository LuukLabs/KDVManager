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
    // EF Core navigation properties, populated by the framework when included in a query.
    public TimeSlot TimeSlot { get; set; } = null!;
    public Group Group { get; set; } = null!;
    public Schedule Schedule { get; set; } = null!;
}