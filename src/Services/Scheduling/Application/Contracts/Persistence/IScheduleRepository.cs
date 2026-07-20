using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface IScheduleRepository : IAsyncRepository<Schedule>
{
    Task<IReadOnlyList<Schedule>> GetSchedulesByChildIdAsync(Guid childId);
    Task<IReadOnlyList<Schedule>> GetSchedulesByDateAsync(DateOnly date, Guid groupId);
    /// <summary>
    /// Gets a schedule and all of its rules for a replacement operation.
    /// The tenant query filter is intentionally applied by the implementation.
    /// </summary>
    Task<Schedule?> GetWithRulesByIdAsync(Guid id);
    Task<bool> IsGroupUsedAsync(Guid groupId);
    Task DeleteSchedulesByChildIdAsync(Guid childId);
    Task<bool> ExistsWithStartDateAsync(Guid childId, DateOnly startDate);
    Task<bool> ExistsWithStartDateExceptAsync(Guid childId, DateOnly startDate, Guid excludedScheduleId);

    /// <summary>
    /// Replaces all rules belonging to a tracked schedule and recalculates the child's timeline
    /// in one database transaction.
    /// </summary>
    Task ReplaceRulesAndRecalculateAsync(Schedule schedule, ICollection<ScheduleRule> replacementRules);
}
