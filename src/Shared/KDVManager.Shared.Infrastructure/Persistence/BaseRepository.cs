using KDVManager.Shared.Application.Contracts.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Shared.Infrastructure.Persistence;

public class BaseRepository<TEntity, TDbContext> : IAsyncRepository<TEntity>
    where TEntity : class
    where TDbContext : DbContext
{
    protected readonly TDbContext _dbContext;

    public BaseRepository(TDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TEntity> AddAsync(TEntity entity)
    {
        await _dbContext.Set<TEntity>().AddAsync(entity);
        await _dbContext.SaveChangesAsync();
        return entity;
    }

    public async Task DeleteAsync(TEntity entity)
    {
        _dbContext.Set<TEntity>().Remove(entity);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(Guid id) =>
        await _dbContext.Set<TEntity>().FindAsync(id) is not null;

    public async Task<TEntity> GetByIdAsync(Guid id) =>
        (await _dbContext.Set<TEntity>().FindAsync(id))!;

    public async Task<IReadOnlyList<TEntity>> ListAllAsync() =>
        await _dbContext.Set<TEntity>().ToListAsync();

    public async Task UpdateAsync(TEntity entity)
    {
        var entry = _dbContext.Entry(entity);
        if (entry.State == EntityState.Detached)
        {
            _dbContext.Set<TEntity>().Attach(entity);
            entry.State = EntityState.Modified;
        }

        await _dbContext.SaveChangesAsync();
    }
}
