using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Domain.Interfaces;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface ITimeSlotRepository : IAsyncRepository<TimeSlot>
{
    Task<IReadOnlyList<TimeSlot>> PagedAsync(IPaginationFilter paginationFilter);

    Task<int> CountAsync();

    Task<bool> IsTimeSlotNameUnique(string name);

    Task<bool> IsTimeSlotNameUniqueExcludingId(string name, Guid excludeId);

    /// <summary>
    /// Returns true if the time slot is referenced by any schedule rule (in use and cannot be deleted).
    /// </summary>
    Task<bool> IsInUseAsync(Guid id);
}

