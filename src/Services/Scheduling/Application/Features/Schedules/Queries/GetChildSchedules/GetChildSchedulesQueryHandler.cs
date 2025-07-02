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
    private readonly IGroupRepository _groupRepository;
    private readonly IMapper _mapper;

    public GetChildSchedulesQueryHandler(
        IMapper mapper,
        IScheduleRepository scheduleRepository,
        IGroupRepository groupRepository)
    {
        _scheduleRepository = scheduleRepository;
        _groupRepository = groupRepository;
        _mapper = mapper;
    }

    public async Task<List<ChildScheduleListVM>> Handle(GetChildSchedulesQuery request, CancellationToken cancellationToken)
    {
        var schedules = await _scheduleRepository.GetSchedulesByChildIdAsync(request.ChildId);

        // Get group information from schedule rules
        var groupIds = schedules
            .SelectMany(s => s.ScheduleRules)
            .Select(sr => sr.GroupId)
            .Distinct();
        var groups = await _groupRepository.GetGroupsByIdsAsync(groupIds.ToList());
        var groupsDictionary = groups.ToDictionary(g => g.Id, g => g.Name);

        // Map and enrich with group names
        var childScheduleListVMs = _mapper.Map<List<ChildScheduleListVM>>(schedules);
        foreach (var schedule in childScheduleListVMs)
        {
            foreach (var scheduleRule in schedule.ScheduleRules)
            {
                if (groupsDictionary.TryGetValue(scheduleRule.GroupId, out var groupName))
                {
                    scheduleRule.GroupName = groupName;
                }
            }
        }

        return childScheduleListVMs;
    }
}

