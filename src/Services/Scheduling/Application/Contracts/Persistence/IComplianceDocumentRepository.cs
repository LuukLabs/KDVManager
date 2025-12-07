using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface IComplianceDocumentRepository : IAsyncRepository<ComplianceDocument>
{
    Task<IReadOnlyList<ComplianceDocument>> GetByGroupAsync(Guid groupId);
    Task<ComplianceDocument?> GetByIdAsync(Guid id);
}
