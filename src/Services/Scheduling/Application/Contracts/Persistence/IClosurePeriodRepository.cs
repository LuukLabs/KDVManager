using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

using KDVManager.Shared.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface IClosurePeriodRepository : IAsyncRepository<ClosurePeriod>
{
    Task<List<ClosurePeriod>> ListByYearAsync(int year);
}
