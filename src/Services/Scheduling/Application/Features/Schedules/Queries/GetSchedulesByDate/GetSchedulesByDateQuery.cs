using System;
using System.Collections.Generic;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetSchedulesByDate;

public class GetSchedulesByDateQuery
{
    public DateOnly Date { get; set; }
    public Guid GroupId { get; set; }
}
