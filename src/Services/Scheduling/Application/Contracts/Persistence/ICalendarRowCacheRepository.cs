using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface ICalendarRowCacheRepository : IAsyncRepository<CalendarRowCache>
{
    Task<List<CalendarRowCache>> GetGroupRangeAsync(Guid groupId, DateOnly startDate, DateOnly endDate);
    Task DeleteGroupRangeAsync(Guid groupId, DateOnly startDate, DateOnly endDate);
    Task DeleteGroupAsync(Guid groupId);
    Task<List<(DateOnly Date, TimeOnly Start, TimeOnly End, int Present, int Absent, int Closed)>> GetGroupedStatusCountsAsync(Guid groupId, DateOnly startDate, DateOnly endDate);
}
