using System;
using System.Collections.Generic;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetChildSchedules;

public class ScheduleDto
{
    public Guid Id { get; set; }
    public Guid ChildId { get; set; }
    public Guid GroupId { get; set; }
    public string GroupName { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public ICollection<ScheduleRule> ScheduleRules { get; set; }
}
