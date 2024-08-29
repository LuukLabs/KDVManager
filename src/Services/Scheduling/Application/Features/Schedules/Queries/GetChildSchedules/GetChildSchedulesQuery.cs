using System;
using System.Collections.Generic;
using KDVManager.Services.Scheduling.Domain;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetChildSchedules;

public class GetChildSchedulesQuery : IRequest<List<ChildScheduleListVM>>
{
    public Guid ChildId { get; set; }
}

