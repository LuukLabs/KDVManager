using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Services;

public record CalendarRowAggregation(DateOnly Date, TimeOnly StartTime, TimeOnly EndTime, int Present, int Absent, int Closed);
public record CalendarRowStatusCountDto(DateOnly Date, TimeOnly StartTime, TimeOnly EndTime, int Present, int Absent, int Closed);

public interface ICalendarRowQueryService
{
    Task<List<CalendarRowCache>> GetRowsAsync(Guid groupId, DateOnly startDate, DateOnly endDate, bool forceRebuild = false);
    Task<List<CalendarRowAggregation>> GetAggregationsAsync(Guid groupId, DateOnly startDate, DateOnly endDate, bool forceRebuild = false);
}
