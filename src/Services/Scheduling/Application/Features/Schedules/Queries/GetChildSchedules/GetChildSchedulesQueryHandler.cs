using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetChildSchedules;

public class GetChildSchedulesQueryHandler
{
    private readonly IScheduleRepository _scheduleRepository;

    public GetChildSchedulesQueryHandler(IScheduleRepository scheduleRepository)
    {
        _scheduleRepository = scheduleRepository;
    }

    public async Task<List<ChildScheduleListVM>> Handle(GetChildSchedulesQuery request)
    {
        var schedules = await _scheduleRepository.GetSchedulesByChildIdAsync(request.ChildId);

        // Map schedules to view models manually
        var childScheduleListVMs = schedules.Select(schedule => new ChildScheduleListVM
        {
            Id = schedule.Id,
            ChildId = schedule.ChildId,
            StartDate = schedule.StartDate,
            EndDate = schedule.EndDate,
            ScheduleRules = schedule.ScheduleRules?.Select(rule => new ChildScheduleListVM.ChildScheduleListVMScheduleRule
            {
                Day = rule.Day,
                TimeSlotId = rule.TimeSlotId,
                TimeSlotName = rule.TimeSlot?.Name ?? string.Empty,
                StartTime = rule.TimeSlot?.StartTime ?? TimeOnly.MinValue,
                EndTime = rule.TimeSlot?.EndTime ?? TimeOnly.MinValue,
                GroupId = rule.GroupId,
                GroupName = rule.Group?.Name ?? string.Empty
            }).ToList() ?? new List<ChildScheduleListVM.ChildScheduleListVMScheduleRule>()
        }).ToList();

        return childScheduleListVMs;
    }
}

