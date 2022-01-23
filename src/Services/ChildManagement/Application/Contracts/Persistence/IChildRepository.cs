using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.ChildManagement.Application.Contracts.Infrastructure;
using KDVManager.Services.ChildManagement.Domain.Entities;
using KDVManager.Services.ChildManagement.Domain.ValueObjects;

namespace KDVManager.Services.ChildManagement.Application.Contracts.Infrastructure
{
    public interface IChildRepository : IAsyncRepository<Child>
    {
        Task<IReadOnlyList<Child>> ListAllAsync(PaginationFilter paginationFilter);
    }
}
