using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface IGroupComplianceSnapshotRepository : IAsyncRepository<GroupComplianceSnapshot>
{
    Task<GroupComplianceSnapshot?> GetLatestAsync(Guid groupId);
    Task<IReadOnlyList<GroupComplianceSnapshot>> GetRangeAsync(Guid groupId, DateTime fromUtc, DateTime toUtc);
}
