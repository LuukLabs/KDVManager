using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using KDVManager.Services.Scheduling.Domain.Entities;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.ScheduleItems.Queries.ListScheduleItems;

public class ListScheduleItemsQueryHandler : IRequestHandler<ListScheduleItemsQuery, List<ScheduleItemListVM>>
{
    private readonly IScheduleItemRepository _scheduleItemRepository;
    private readonly IMapper _mapper;

    public ListScheduleItemsQueryHandler(IMapper mapper, IScheduleItemRepository scheduleItemRepository)
    {
        _scheduleItemRepository = scheduleItemRepository;
        _mapper = mapper;
    }

    public async Task<List<ScheduleItemListVM>> Handle(ListScheduleItemsQuery request, CancellationToken cancellationToken)
    {
        var scheduleItems = await _scheduleItemRepository.GetScheduleItemsByChildIdAsync(request.ChildId);

        List<ScheduleItemListVM> scheduleItemListVMs = _mapper.Map<List<ScheduleItemListVM>>(scheduleItems);

        return new List<ScheduleItemListVM>(scheduleItemListVMs);
    }
}

