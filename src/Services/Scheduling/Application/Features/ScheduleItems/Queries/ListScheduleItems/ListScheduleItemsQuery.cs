using System;
using System.Collections.Generic;
using KDVManager.Services.Scheduling.Domain;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.ScheduleItems.Queries.ListScheduleItems;

public class ListScheduleItemsQuery : IRequest<List<ScheduleItemListVM>>
{
    public Guid ChildId { get; set; }
}

