using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Exceptions;
using KDVManager.Services.Scheduling.Application.Features.Compliance.Models;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.Compliance.Queries.ListComplianceDocuments;

public class ListComplianceDocumentsQueryHandler
{
    private readonly IComplianceDocumentRepository _documentRepository;
    private readonly IGroupRepository _groupRepository;

    public ListComplianceDocumentsQueryHandler(IComplianceDocumentRepository documentRepository, IGroupRepository groupRepository)
    {
        _documentRepository = documentRepository;
        _groupRepository = groupRepository;
    }

    public async Task<IReadOnlyList<ComplianceDocumentDto>> Handle(ListComplianceDocumentsQuery request)
    {
        var group = await _groupRepository.GetByIdAsync(request.GroupId) ??
                    throw new NotFoundException(nameof(Group), request.GroupId);

        var docs = await _documentRepository.GetByGroupAsync(group.Id);
        return docs.Select(d => new ComplianceDocumentDto
        {
            Id = d.Id,
            GroupId = d.GroupId,
            Title = d.Title,
            FileName = d.FileName,
            ContentType = d.ContentType,
            UploadedAtUtc = d.UploadedAtUtc,
            UploadedBy = d.UploadedBy,
            ValidFromUtc = d.ValidFrom,
            ValidUntilUtc = d.ValidUntil,
        }).ToList();
    }
}
