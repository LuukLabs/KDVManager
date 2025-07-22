using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Shared.Domain.Utilities;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetSchedulesByDate;

public class GetSchedulesByDateQueryHandler
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IChildRepository _childRepository;

    public GetSchedulesByDateQueryHandler(IScheduleRepository scheduleRepository, IChildRepository childRepository)
    {
        _scheduleRepository = scheduleRepository;
        _childRepository = childRepository;
    }

    public async Task<List<ScheduleByDateVM>> Handle(GetSchedulesByDateQuery request)
    {
        var schedules = await _scheduleRepository.GetSchedulesByDateAsync(request.Date, request.GroupId);

        var allScheduleRules = schedules.SelectMany(s => s.ScheduleRules).ToList();

        // Fetch all children by their IDs
        var childIds = schedules.Select(s => s.ChildId).Distinct().ToList();
        var children = await _childRepository.GetChildrenByIdsAsync(childIds);

        // Map schedule rules to view models manually
        var scheduleByDateVMs = allScheduleRules.Select(rule =>
        {
            var child = children.FirstOrDefault(c => c.Id == rule.Schedule.ChildId);

            return new ScheduleByDateVM
            {
                ScheduleId = rule.ScheduleId,
                ChildId = rule.Schedule.ChildId,
                TimeSlotName = rule.TimeSlot.Name,
                StartTime = rule.TimeSlot.StartTime,
                EndTime = rule.TimeSlot.EndTime,
                GroupId = rule.GroupId,
                DateOfBirth = child?.DateOfBirth,
                Age = child != null ? DateTimeUtilities.CalculateAge(child.DateOfBirth, request.Date) : null
            };
        }).ToList();

        return scheduleByDateVMs;
    }
}
