using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetSchedulesByDate;

public class GetSchedulesByDateQueryHandler
{
    private readonly IScheduleRepository _scheduleRepository;

    public GetSchedulesByDateQueryHandler(IScheduleRepository scheduleRepository)
    {
        _scheduleRepository = scheduleRepository;
    }

    public async Task<List<ScheduleByDateVM>> Handle(GetSchedulesByDateQuery request)
    {
        var schedules = await _scheduleRepository.GetSchedulesByDateAsync(request.Date, request.GroupId);

        var allScheduleRules = schedules.SelectMany(s => s.ScheduleRules).ToList();

        // Map schedule rules to view models manually
        var scheduleByDateVMs = allScheduleRules.Select(rule => new ScheduleByDateVM
        {
            ScheduleId = rule.ScheduleId,
            ChildId = rule.Schedule.ChildId,
            TimeSlotName = rule.TimeSlot.Name,
            StartTime = rule.TimeSlot.StartTime,
            EndTime = rule.TimeSlot.EndTime,
            GroupId = rule.GroupId,
            GroupName = rule.Group.Name
        }).ToList();

        return scheduleByDateVMs;
    }
}
