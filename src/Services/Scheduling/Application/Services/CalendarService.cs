using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Services;

public class CalendarService : ICalendarService
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IAbsenceRepository _absenceRepository;
    private readonly IClosurePeriodRepository _closureRepository;
    private readonly IChildRepository _childRepository;

    public CalendarService(
        IScheduleRepository scheduleRepository,
        IAbsenceRepository absenceRepository,
        IClosurePeriodRepository closureRepository,
        IChildRepository childRepository)
    {
        _scheduleRepository = scheduleRepository;
        _absenceRepository = absenceRepository;
        _closureRepository = closureRepository;
        _childRepository = childRepository;
    }

    public async Task<IReadOnlyList<CalendarEvent>> GetForGroupsAsync(IEnumerable<Guid>? groupIds, DateOnly from, DateOnly to, CancellationToken cancellationToken = default)
    {
        if (to < from) throw new ArgumentException("End date must be after or equal to start date", nameof(to));
        var groupIdList = groupIds?.Distinct().ToList() ?? new List<Guid>();
        var schedules = groupIdList.Any()
            ? await _scheduleRepository.ListByGroupsAndDateRangeAsync(groupIdList, from, to)
            : new List<Schedule>();
        var closures = await _closureRepository.ListByDateRangeAsync(from, to);
        var childIds = schedules.Select(s => s.ChildId).Distinct().ToList();
        var absences = childIds.Any() ? await _absenceRepository.GetByChildIdsAndDateRangeAsync(childIds, from, to) : new List<Absence>();
        return BuildEvents(schedules, absences, closures, from, to);
    }

    public async Task<IReadOnlyList<CalendarEvent>> GetForChildAsync(Guid childId, DateOnly from, DateOnly to, CancellationToken cancellationToken = default)
    {
    var schedules = await _scheduleRepository.ListByChildAndDateRangeAsync(childId, from, to);
        var closures = await _closureRepository.ListByDateRangeAsync(from, to);
        var absences = await _absenceRepository.GetByChildIdsAndDateRangeAsync(new[] { childId }, from, to);
        return BuildEvents(schedules, absences, closures, from, to);
    }

    public async Task<IReadOnlyList<CalendarEvent>> GetAllAsync(DateOnly from, DateOnly to, CancellationToken cancellationToken = default)
    {
        // Currently we need groups to scope schedules; returning only closures until a global expansion is defined.
        var closures = await _closureRepository.ListByDateRangeAsync(from, to);
        var events = closures.Select(cp => new CalendarEvent
        {
            Id = cp.Id,
            Type = CalendarEventType.Closure,
            Start = cp.StartDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc),
            End = cp.EndDate.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc),
            Title = "Closure",
            Description = cp.Reason
        }).ToList();
        return events;
    }

    private IReadOnlyList<CalendarEvent> BuildEvents(List<Schedule> schedules, List<Absence> absences, List<ClosurePeriod> closures, DateOnly from, DateOnly to)
    {
        var events = new List<CalendarEvent>();
        // closures
        foreach (var cp in closures)
        {
            events.Add(new CalendarEvent
            {
                Id = cp.Id,
                Type = CalendarEventType.Closure,
                Start = cp.StartDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc),
                End = cp.EndDate.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc),
                Title = "Closure",
                Description = cp.Reason
            });
        }

        // Pre-index absences by child and day for quick lookup
        var absenceLookup = absences
            .SelectMany(a => ExpandDays(a.StartDate, a.EndDate, from, to).Select(d => (a.ChildId, Day: d, a)))
            .GroupBy(x => (x.ChildId, x.Day))
            .ToDictionary(g => g.Key, g => g.First().a);

        foreach (var schedule in schedules)
        {
            var effectiveStart = Max(schedule.StartDate, from);
            var effectiveEnd = Min(schedule.EndDate ?? to, to);
            if (effectiveEnd < effectiveStart) continue;
            foreach (var rule in schedule.ScheduleRules)
            {
                var first = NextOrSame(effectiveStart, rule.Day);
                for (var day = first; day <= effectiveEnd; day = day.AddDays(7))
                {
                    var ts = rule.TimeSlot;
                    var startDateTime = day.ToDateTime(ts.StartTime, DateTimeKind.Utc);
                    var endDateTime = day.ToDateTime(ts.EndTime, DateTimeKind.Utc);
                    var type = absenceLookup.ContainsKey((schedule.ChildId, day)) ? CalendarEventType.Absence : CalendarEventType.ScheduleRule;
                    var description = type == CalendarEventType.Absence ? absenceLookup[(schedule.ChildId, day)].Reason : $"Rule {rule.Day} ({ts.StartTime}-{ts.EndTime})";
                    events.Add(new CalendarEvent
                    {
                        Id = rule.Id,
                        GroupId = rule.GroupId,
                        ChildId = schedule.ChildId,
                        Type = type,
                        Start = startDateTime,
                        End = endDateTime,
                        Title = type == CalendarEventType.Absence ? "Absence" : ts.Name,
                        Description = description
                    });
                }
            }
        }

        return events.OrderBy(e => e.Start).ThenBy(e => e.End).ToList();
    }

    private static DateOnly Max(DateOnly a, DateOnly b) => a > b ? a : b;
    private static DateOnly Min(DateOnly a, DateOnly b) => a < b ? a : b;
    private static DateOnly NextOrSame(DateOnly date, DayOfWeek dow)
    {
        int diff = ((int)dow - (int)date.DayOfWeek + 7) % 7;
        return date.AddDays(diff);
    }
    private static IEnumerable<DateOnly> ExpandDays(DateOnly start, DateOnly end, DateOnly windowStart, DateOnly windowEnd)
    {
        var s = Max(start, windowStart);
        var e = Min(end, windowEnd);
        for (var d = s; d <= e; d = d.AddDays(1)) yield return d;
    }
}
