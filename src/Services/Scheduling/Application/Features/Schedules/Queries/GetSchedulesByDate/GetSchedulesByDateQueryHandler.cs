using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetSchedulesByDate;

public class GetSchedulesByDateQueryHandler : IRequestHandler<GetSchedulesByDateQuery, List<ScheduleByDateVM>>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IMapper _mapper;

    public GetSchedulesByDateQueryHandler(
        IMapper mapper,
        IScheduleRepository scheduleRepository)
    {
        _scheduleRepository = scheduleRepository;
        _mapper = mapper;
    }

    public async Task<List<ScheduleByDateVM>> Handle(GetSchedulesByDateQuery request, CancellationToken cancellationToken)
    {
        var schedules = await _scheduleRepository.GetSchedulesByDateAsync(request.Date, request.GroupId);

        var allScheduleRules = schedules.SelectMany(s => s.ScheduleRules).ToList();

        return _mapper.Map<List<ScheduleByDateVM>>(allScheduleRules);
    }
}
