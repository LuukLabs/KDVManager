using KDVManager.Shared.Application.Contracts.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Shared.Infrastructure.Persistence;

public class BaseRepository<T, TContext> : IAsyncRepository<T>
    where T : class
    where TContext : DbContext
{
    protected readonly TContext _dbContext;

    public BaseRepository(TContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<T> AddAsync(T entity)
    {
        await _dbContext.Set<T>().AddAsync(entity);
        await _dbContext.SaveChangesAsync();

        return entity;
    }

    public async Task DeleteAsync(T entity)
    {
        _dbContext.Set<T>().Remove(entity);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<T> GetByIdAsync(Guid id)
    {
        // Interface expects non-null; callers should verify existence via ExistsAsync when needed.
        // Suppress possible null warning with null-forgiving operator.
        return (await _dbContext.Set<T>().FindAsync(id))!;
    }

    public async Task<IReadOnlyList<T>> ListAllAsync()
    {
        return await _dbContext.Set<T>().ToListAsync();
    }

    public async Task UpdateAsync(T entity)
    {
        // If the entity is being tracked already (typical for update flows where we queried first),
        // we don't need to force the state to Modified. Forcing Modified on an already tracked graph
        // can result in EF issuing updates for unchanged entities and increases the chance of
        // concurrency issues when dependents were concurrently deleted.
        var entry = _dbContext.Entry(entity);
        if (entry.State == EntityState.Detached)
        {
            _dbContext.Set<T>().Attach(entity);
            entry.State = EntityState.Modified;
        }

        await _dbContext.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _dbContext.Set<T>().FindAsync(id) != null;
    }
}
