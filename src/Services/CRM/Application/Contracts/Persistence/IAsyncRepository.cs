using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace KDVManager.Services.CRM.Application.Contracts.Infrastructure
{
    public interface IAsyncRepository<T> where T : class
    {
        Task<T> GetByIdAsync(Guid id);
        Task<IReadOnlyList<T>> ListAllAsync();
        Task<T> AddAsync(T entity);
        Task DeleteAsync(T entity);
        Task UpdateAsync(T entity);
    }
}
