using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Domain.Services;

/// <summary>
/// Pure domain calculation logic for recomputing schedule EndDates based on chronological order and EndMarks.
/// </summary>
public static class ScheduleEndDateCalculator
{
    /// <summary>
    /// Recalculate all schedules for a child in-place.
    /// </summary>
    public static void Recalculate(IList<Schedule> schedules, IList<EndMark> endMarks)
    {
        if (schedules == null || schedules.Count == 0) return;

        var orderedSchedules = schedules.OrderBy(s => s.StartDate).ToList();
        var orderedMarks = (endMarks ?? Enumerable.Empty<EndMark>())
            .OrderBy(m => m.EndDate)
            .ToList();

        Console.WriteLine($"[Recalculate] Processing {orderedSchedules.Count} schedules and {orderedMarks.Count} end marks.");

        for (int i = 0; i < orderedSchedules.Count; i++)
        {
            var schedule = orderedSchedules[i];
            var nextSchedule = i + 1 < orderedSchedules.Count ? orderedSchedules[i + 1] : null;

            Console.WriteLine($"[Schedule] Child={schedule.ChildId}, Start={schedule.StartDate}");

            var candidateFromNext = GetNextScheduleEndCandidate(nextSchedule);
            Console.WriteLine($"  Candidate from next schedule: {(candidateFromNext?.ToString() ?? "none")}");

            var candidateFromMark = GetEndMarkCandidate(schedule, nextSchedule, orderedMarks);
            Console.WriteLine($"  Candidate from end mark: {(candidateFromMark?.ToString() ?? "none")}");

            var chosen = MinDate(candidateFromNext, candidateFromMark);

            if (!chosen.HasValue)
            {
                Console.WriteLine("  → No candidate found, setting EndDate = null");
                schedule.SetCalculatedEndDate(null);
                continue;
            }

            if (chosen.Value < schedule.StartDate)
            {
                Console.WriteLine($"  → Chosen {chosen} is before start {schedule.StartDate}, discarding.");
                chosen = null;
            }
            else
            {
                Console.WriteLine($"  → Chosen EndDate = {chosen}");
            }

            schedule.SetCalculatedEndDate(chosen);
        }
    }

    private static DateOnly? GetNextScheduleEndCandidate(Schedule? nextSchedule) =>
        nextSchedule?.StartDate.AddDays(-1);

    private static DateOnly? GetEndMarkCandidate(Schedule schedule, Schedule? nextSchedule, List<EndMark> orderedMarks)
    {
        var candidate = orderedMarks
            .Where(m =>
                m.ChildId == schedule.ChildId &&
                m.EndDate > schedule.StartDate &&
                (nextSchedule == null || m.EndDate < nextSchedule.StartDate))
            .Select(m => m.EndDate.AddDays(-1))
            .FirstOrDefault();

        return candidate == default ? null : candidate;
    }

    private static DateOnly? MinDate(DateOnly? first, DateOnly? second)
    {
        if (first == null) return second;
        if (second == null) return first;
        return first < second ? first : second;
    }
}
