using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Contracts.Persistence;

public interface IChildActivityIntervalRepository
{
  Task<IReadOnlyList<ChildActivityInterval>> GetByChildIdAsync(Guid childId);
  Task DeleteByChildIdAsync(Guid childId);
  Task AddRangeAsync(IEnumerable<ChildActivityInterval> intervals);
}
