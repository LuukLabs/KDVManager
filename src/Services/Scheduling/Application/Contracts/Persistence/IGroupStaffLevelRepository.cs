using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface IGroupStaffLevelRepository : IAsyncRepository<GroupStaffLevel>
{
    Task<GroupStaffLevel?> GetLatestForGroupAsync(Guid groupId, DateTime atUtc);
}
