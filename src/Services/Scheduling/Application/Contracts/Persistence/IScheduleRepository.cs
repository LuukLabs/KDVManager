using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Domain.Interfaces;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface IScheduleRepository : IAsyncRepository<Schedule>
{
    Task<IReadOnlyList<Schedule>> GetSchedulesByChildIdAsync(Guid childId);
    Task<IReadOnlyList<Schedule>> GetSchedulesByDateAsync(DateOnly date, Guid groupId);
    Task<bool> IsGroupUsedAsync(Guid groupId);
    Task DeleteSchedulesByChildIdAsync(Guid childId);
    Task<bool> ExistsWithStartDateAsync(Guid childId, DateOnly startDate);
    /// <summary>
    /// Bulk fetch schedules (with rules, timeslots, group) for children in provided groups that intersect date range.
    /// </summary>
    Task<List<Schedule>> ListByGroupsAndDateRangeAsync(IEnumerable<Guid> groupIds, DateOnly from, DateOnly to);
    /// <summary>
    /// Fetch schedules (with rules) for a single child intersecting a date range.
    /// </summary>
    Task<List<Schedule>> ListByChildAndDateRangeAsync(Guid childId, DateOnly from, DateOnly to);
}
