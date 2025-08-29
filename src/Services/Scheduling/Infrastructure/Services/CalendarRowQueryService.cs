using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Services;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Infrastructure.Services;

public class CalendarRowQueryService : ICalendarRowQueryService
{
    private readonly ICalendarRowCacheRepository _cacheRepository;
    private readonly ICalendarRowCalculator _calculator;

    public CalendarRowQueryService(ICalendarRowCacheRepository cacheRepository, ICalendarRowCalculator calculator)
    {
        _cacheRepository = cacheRepository;
        _calculator = calculator;
    }

    public async Task<List<CalendarRowCache>> GetRowsAsync(Guid groupId, DateOnly startDate, DateOnly endDate, bool forceRebuild = false)
    {
        if (forceRebuild)
        {
            return await _calculator.RecalculateAsync(groupId, startDate, endDate);
        }

        var rows = await _cacheRepository.GetGroupRangeAsync(groupId, startDate, endDate);
        bool needsRecalc = false;
        // Quick completeness check: ensure each date has at least been processed if any schedules existed
        var dateSpan = Enumerable.Range(0, (endDate.DayNumber - startDate.DayNumber) + 1).Select(i => startDate.AddDays(i)).ToList();
        var missingDates = dateSpan.Except(rows.Select(r => r.Date).Distinct()).ToList();
        if (missingDates.Count > 0)
            needsRecalc = true;

        if (needsRecalc)
        {
            rows = await _calculator.RecalculateAsync(groupId, startDate, endDate);
        }
        return rows.OrderBy(r => r.Date).ThenBy(r => r.StartTime).ThenBy(r => r.ChildId).ToList();
    }

    public async Task<List<CalendarRowAggregation>> GetAggregationsAsync(Guid groupId, DateOnly startDate, DateOnly endDate, bool forceRebuild = false)
    {
        // Ensure rows present (may create fresh cache) but avoid duplication of grouping work if not forced
        var rows = await GetRowsAsync(groupId, startDate, endDate, forceRebuild);
        var grouped = await _cacheRepository.GetGroupedStatusCountsAsync(groupId, startDate, endDate);
        return grouped
            .OrderBy(g => g.Date)
            .ThenBy(g => g.Start)
            .Select(g => new CalendarRowAggregation(g.Date, g.Start, g.End, g.Present, g.Absent, g.Closed))
            .ToList();
    }
}
