using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

using KDVManager.Shared.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface IEndMarkRepository : IAsyncRepository<EndMark>
{
    Task<IReadOnlyList<EndMark>> GetByChildIdAsync(Guid childId);
    Task<IReadOnlyList<EndMark>> GetSystemGeneratedByChildIdAsync(Guid childId);
}
