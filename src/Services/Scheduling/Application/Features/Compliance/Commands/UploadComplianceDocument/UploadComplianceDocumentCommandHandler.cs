using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Exceptions;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.Compliance.Commands.UploadComplianceDocument;

public class UploadComplianceDocumentCommandHandler
{
    private readonly IComplianceDocumentRepository _documentRepository;
    private readonly IGroupRepository _groupRepository;

    public UploadComplianceDocumentCommandHandler(IComplianceDocumentRepository documentRepository, IGroupRepository groupRepository)
    {
        _documentRepository = documentRepository;
        _groupRepository = groupRepository;
    }

    public async Task<Guid> Handle(UploadComplianceDocumentCommand request)
    {
        var validator = new UploadComplianceDocumentCommandValidator();
        var validation = await validator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            throw new ValidationException(validation);
        }

        var group = await _groupRepository.GetByIdAsync(request.GroupId) ??
                    throw new NotFoundException(nameof(Group), request.GroupId);

        var entity = new ComplianceDocument
        {
            Id = Guid.NewGuid(),
            GroupId = request.GroupId,
            Title = request.Title,
            FileName = request.FileName,
            ContentType = request.ContentType,
            Blob = request.Data,
            UploadedAtUtc = DateTime.UtcNow,
            UploadedBy = request.UploadedBy,
            ValidFrom = request.ValidFromUtc,
            ValidUntil = request.ValidUntilUtc,
            TenantId = group.TenantId,
        };

        await _documentRepository.AddAsync(entity);
        return entity.Id;
    }
}
