using System;
using System.Collections.Generic;
using KDVManager.Services.Scheduling.Domain;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetChildSchedules;

public class GetChildSchedulesQuery
{
    public Guid ChildId { get; set; }
}

