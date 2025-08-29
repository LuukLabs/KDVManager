using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Services;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Infrastructure.Services;

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
        var dates = new List<DateOnly>();
        for (var d = startDate; d <= endDate; d = d.AddDays(1)) dates.Add(d);
        var datesByDay = dates.GroupBy(d => d.DayOfWeek).ToDictionary(g => g.Key, g => g.ToList());

        foreach (var schedule in schedules)
        {
            foreach (var rule in schedule.ScheduleRules.Where(r => r.GroupId == groupId))
            {
                if (!datesByDay.TryGetValue(rule.Day, out var ruleDates)) continue;
                foreach (var date in ruleDates)
                {
                    if (date < schedule.StartDate || (schedule.EndDate.HasValue && date > schedule.EndDate.Value)) continue;

                    var closure = relevantClosures.FirstOrDefault(c => date >= c.StartDate && date <= c.EndDate);
                    string status;
                    string? reason = null;
                    if (closure != null)
                    {
                        status = "closed";
                        reason = closure.Reason;
                    }
                    else
                    {
                        var absence = relevantAbsences.FirstOrDefault(a => a.ChildId == schedule.ChildId && date >= a.StartDate && date <= a.EndDate);
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
                    var age = child.Age(date);
                    rows.Add(new CalendarRowCache
                    {
                        Id = Guid.NewGuid(),
                        GroupId = groupId,
                        ChildId = schedule.ChildId,
                        Date = date,
                        SlotId = rule.TimeSlotId,
                        SlotName = rule.TimeSlot.Name,
                        StartTime = rule.TimeSlot.StartTime,
                        EndTime = rule.TimeSlot.EndTime,
                        Status = status,
                        Reason = reason,
                        Birthday = child.DateOfBirth,
                        AgeYears = age
                    });
                }
            }
        }

        // Replace existing cache rows for that range
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
