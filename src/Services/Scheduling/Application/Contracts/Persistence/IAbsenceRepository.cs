using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface IAbsenceRepository : IAsyncRepository<Absence>
{
    Task<List<Absence>> GetByChildIdAsync(Guid childId);
    Task<List<Absence>> GetByChildIdsAsync(IEnumerable<Guid> childIds);
    /// <summary>
    /// Returns absences intersecting the provided date range for the specified child ids.
    /// </summary>
    Task<List<Absence>> GetByChildIdsAndDateRangeAsync(IEnumerable<Guid> childIds, DateOnly from, DateOnly to);
}
