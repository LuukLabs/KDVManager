using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Services;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Shared.Domain.Extensions;

namespace KDVManager.Services.Scheduling.Application.Services.Implementation;

public class CalendarRowCalculator : ICalendarRowCalculator
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IAbsenceRepository _absenceRepository;
    private readonly IClosurePeriodRepository _closurePeriodRepository;
    private readonly ICalendarRowCacheRepository _cacheRepository;
    private readonly IChildRepository _childRepository;

    public CalendarRowCalculator(
        IScheduleRepository scheduleRepository,
        IAbsenceRepository absenceRepository,
        IClosurePeriodRepository closurePeriodRepository,
        ICalendarRowCacheRepository cacheRepository,
        IChildRepository childRepository)
    {
        _scheduleRepository = scheduleRepository;
        _absenceRepository = absenceRepository;
        _closurePeriodRepository = closurePeriodRepository;
        _cacheRepository = cacheRepository;
        _childRepository = childRepository;
    }

    public async Task<List<CalendarRowCache>> RecalculateAsync(Guid groupId, DateOnly startDate, DateOnly endDate)
    {
        var schedules = await _scheduleRepository.GetSchedulesForGroupInRangeAsync(groupId, startDate, endDate);
        var childIds = schedules.Select(s => s.ChildId).Distinct().ToList();
        var relevantAbsences = await _absenceRepository.GetByChildrenAndDateRangeAsync(childIds, startDate, endDate);
        var relevantClosures = await _closurePeriodRepository.GetOverlappingRangeAsync(startDate, endDate);
        var children = await _childRepository.GetChildrenByIdsAsync(childIds);
        var childLookup = children.ToDictionary(c => c.Id, c => c);

        var rows = new List<CalendarRowCache>();
        for (var d = startDate; d <= endDate; d = d.AddDays(1))
        {
            foreach (var schedule in schedules)
            {
                if (d < schedule.StartDate || (schedule.EndDate.HasValue && d > schedule.EndDate.Value)) continue;
                foreach (var rule in schedule.ScheduleRules.Where(r => r.GroupId == groupId && r.Day == d.DayOfWeek))
                {
                    var closure = relevantClosures.FirstOrDefault(c => d >= c.StartDate && d <= c.EndDate);
                    string status;
                    string? reason = null;
                    if (closure != null)
                    {
                        status = "closed";
                        reason = closure.Reason;
                    }
                    else
                    {
                        var absence = relevantAbsences.FirstOrDefault(a => a.ChildId == schedule.ChildId && d >= a.StartDate && d <= a.EndDate);
                        if (absence != null)
                        {
                            status = "absent";
                            reason = absence.Reason;
                        }
                        else
                        {
                            status = "present";
                        }
                    }

                    var child = childLookup[schedule.ChildId];
                    var age = child.Age(d);
                    rows.Add(new CalendarRowCache
                    {
                        Id = Guid.NewGuid(),
                        GroupId = groupId,
                        ChildId = schedule.ChildId,
                        Date = d,
                        SlotId = rule.TimeSlotId,
                        SlotName = rule.TimeSlot.Name,
                        StartTime = rule.TimeSlot.StartTime,
                        EndTime = rule.TimeSlot.EndTime,
                        Status = status,
                        Reason = reason,
                        Birthday = child.DateOfBirth,
                        Age = age
                    });
                }
            }
        }

        await _cacheRepository.DeleteGroupRangeAsync(groupId, startDate, endDate);
        foreach (var chunk in rows.Chunk(200))
        {
            foreach (var r in chunk)
            {
                await _cacheRepository.AddAsync(r);
            }
        }

        return rows;
    }
}
