using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using KDVManager.Services.Scheduling.Domain.Entities;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetChildSchedules;

public class GetChildSchedulesQueryHandler : IRequestHandler<GetChildSchedulesQuery, List<ChildScheduleListVM>>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IMapper _mapper;

    public GetChildSchedulesQueryHandler(
        IMapper mapper,
        IScheduleRepository scheduleRepository)
    {
        _scheduleRepository = scheduleRepository;
        _mapper = mapper;
    }

    public async Task<List<ChildScheduleListVM>> Handle(GetChildSchedulesQuery request, CancellationToken cancellationToken)
    {
        var schedules = await _scheduleRepository.GetSchedulesByChildIdAsync(request.ChildId);

        // Map schedules to view models (group names will be mapped automatically through navigation properties)
        var childScheduleListVMs = _mapper.Map<List<ChildScheduleListVM>>(schedules);

        return childScheduleListVMs;
    }
}

