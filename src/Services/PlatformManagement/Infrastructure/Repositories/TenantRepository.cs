using KDVManager.Services.PlatformManagement.Application.Contracts.Persistence;
using KDVManager.Services.PlatformManagement.Domain.Entities;

namespace KDVManager.Services.PlatformManagement.Infrastructure.Repositories;

public class TenantRepository : BaseRepository<Tenant>, ITenantRepository
{
    public TenantRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
