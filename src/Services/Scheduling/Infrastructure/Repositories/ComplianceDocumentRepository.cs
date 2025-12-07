using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public class ComplianceDocumentRepository : BaseRepository<ComplianceDocument>, IComplianceDocumentRepository
{
    public ComplianceDocumentRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<ComplianceDocument?> GetByIdAsync(Guid id)
    {
        return await _dbContext.Set<ComplianceDocument>().FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<IReadOnlyList<ComplianceDocument>> GetByGroupAsync(Guid groupId)
    {
        return await _dbContext.Set<ComplianceDocument>()
            .Where(d => d.GroupId == groupId)
            .OrderByDescending(d => d.UploadedAtUtc)
            .ToListAsync();
    }
}
