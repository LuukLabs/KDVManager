using KDVManager.Shared.Infrastructure.Persistence;

namespace KDVManager.Services.CRM.Infrastructure.Repositories;

public class BaseRepository<T> : BaseRepository<T, ApplicationDbContext> where T : class
{
    public BaseRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
