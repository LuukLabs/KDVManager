using KDVManager.Services.PlatformManagement.Domain.Entities;

namespace KDVManager.Services.PlatformManagement.Application.Contracts.Persistence;

public interface ITenantRepository : IAsyncRepository<Tenant>
{
}
