namespace KDVManager.Shared.Application.Contracts.Persistence;

public interface IAsyncRepository<T> where T : class
{
    Task<T> AddAsync(T entity);
    Task DeleteAsync(T entity);
    Task<bool> ExistsAsync(Guid id);
    Task<T> GetByIdAsync(Guid id);
    Task<IReadOnlyList<T>> ListAllAsync();
    Task UpdateAsync(T entity);
}
