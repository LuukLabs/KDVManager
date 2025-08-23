﻿using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Services.CRM.Domain.Interfaces;

namespace KDVManager.Services.CRM.Application.Contracts.Persistence;

public interface IChildRepository : IAsyncRepository<Child>
{
    Task<IReadOnlyList<Child>> PagedAsync(IPaginationFilter paginationFilter, string? search = null);
    Task<int> CountAsync(string? search = null);
}
