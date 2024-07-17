using System;

namespace KDVManager.Services.Scheduling.Application.Features.ScheduleItems.Queries.ListScheduleItems;

public class ScheduleItemListVM
{
    public Guid Id { get; set; }
    public Guid ChildId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

