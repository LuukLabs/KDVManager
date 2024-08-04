using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Domain.Interfaces;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface IScheduleItemRepository : IAsyncRepository<ScheduleItem>
{
    Task<IReadOnlyList<ScheduleItem>> GetScheduleItemsByChildIdAsync(Guid childId);
}
