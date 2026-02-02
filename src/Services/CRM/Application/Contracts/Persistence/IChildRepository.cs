using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Services.CRM.Domain.Interfaces;

namespace KDVManager.Services.CRM.Application.Contracts.Persistence;

public interface IChildRepository : IAsyncRepository<Child>
{
    Task<IReadOnlyList<Child>> PagedAsync(IPaginationFilter paginationFilter, string? search = null);
    Task<IReadOnlyList<Child>> PagedWithIntervalsAsync(IPaginationFilter paginationFilter, string? search = null);
    Task<Child?> GetByIdWithIntervalsAsync(Guid id);
    Task<int> CountAsync(string? search = null);
    
    /// <summary>
    /// Gets all children that have an activity interval overlapping with the specified date range.
    /// A child is considered active if any of their intervals overlap with the period.
    /// </summary>
    /// <param name="startDate">Start of the period (inclusive)</param>
    /// <param name="endDate">End of the period (inclusive)</param>
    /// <returns>List of children with their activity intervals loaded</returns>
    Task<IReadOnlyList<Child>> GetActiveChildrenInPeriodAsync(DateOnly startDate, DateOnly endDate);
}
