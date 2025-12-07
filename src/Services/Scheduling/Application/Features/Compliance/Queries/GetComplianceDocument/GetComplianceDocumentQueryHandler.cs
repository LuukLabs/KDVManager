using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Exceptions;
using KDVManager.Services.Scheduling.Application.Features.Compliance.Models;

namespace KDVManager.Services.Scheduling.Application.Features.Compliance.Queries.GetComplianceDocument;

public class GetComplianceDocumentQueryHandler
{
    private readonly IComplianceDocumentRepository _documentRepository;

    public GetComplianceDocumentQueryHandler(IComplianceDocumentRepository documentRepository)
    {
        _documentRepository = documentRepository;
    }

    public async Task<ComplianceDocumentContentDto> Handle(GetComplianceDocumentQuery request)
    {
        var entity = await _documentRepository.GetByIdAsync(request.DocumentId) ??
                     throw new NotFoundException("ComplianceDocument", request.DocumentId);

        return new ComplianceDocumentContentDto
        {
            Id = entity.Id,
            FileName = entity.FileName,
            ContentType = entity.ContentType,
            Data = entity.Blob,
            UploadedAtUtc = entity.UploadedAtUtc,
        };
    }
}
