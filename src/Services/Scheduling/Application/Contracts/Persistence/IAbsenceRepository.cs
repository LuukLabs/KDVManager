using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface IAbsenceRepository : IAsyncRepository<Absence>
{
    Task<List<Absence>> GetByChildIdAsync(Guid childId);
}
