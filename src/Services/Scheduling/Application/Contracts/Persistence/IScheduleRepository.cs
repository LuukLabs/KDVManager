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
}
