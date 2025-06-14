using System;
using System.Collections.Generic;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetSchedulesByDate;

public class GetSchedulesByDateQuery : IRequest<List<ScheduleByDateVM>>
{
    public DateOnly Date { get; set; }
    public Guid GroupId { get; set; }
}
