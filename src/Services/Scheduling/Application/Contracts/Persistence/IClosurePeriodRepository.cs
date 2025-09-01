using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface IClosurePeriodRepository : IAsyncRepository<ClosurePeriod>
{
    Task<List<ClosurePeriod>> ListByYearAsync(int year);
    /// <summary>
    /// List closure periods that overlap the provided (inclusive) date range.
    /// </summary>
    Task<List<ClosurePeriod>> ListByDateRangeAsync(DateOnly from, DateOnly to);
}
