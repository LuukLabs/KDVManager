using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public class TimeSlotRepository : BaseRepository<TimeSlot>, ITimeSlotRepository
{
    public TimeSlotRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<IReadOnlyList<TimeSlot>> PagedAsync(IPaginationFilter paginationFilter)
    {
        int skip = (paginationFilter.PageNumber - 1) * paginationFilter.PageSize;

        return await _dbContext.Set<TimeSlot>()
        .OrderBy(timeSlot => timeSlot.EndTime).ThenBy(timeSlot => timeSlot.StartTime)
        .Skip((paginationFilter.PageNumber - 1) * paginationFilter.PageSize).Take(paginationFilter.PageSize)
        .ToListAsync();
    }

    public async Task<int> CountAsync()
    {
        return await _dbContext.Set<TimeSlot>().CountAsync();
    }

    public async Task<bool> IsTimeSlotNameUnique(string name)
    {
        var matches = _dbContext.TimeSlots.Any(e => e.Name.Equals(name));
        return await Task.FromResult(matches);
    }
}
