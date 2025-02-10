using System;
using System.Collections.Generic;

namespace KDVManager.Services.Scheduling.Domain.Entities;

public class Schedule
{
    public Guid Id { get; set; }
    public Guid ChildId { get; set; }
    public Guid GroupId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public ICollection<ScheduleRule> ScheduleRules { get; set; }
}