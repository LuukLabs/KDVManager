using FluentValidation;

namespace KDVManager.Services.Scheduling.Application.Features.Compliance.Commands.UploadComplianceDocument;

public class UploadComplianceDocumentCommandValidator : AbstractValidator<UploadComplianceDocumentCommand>
{
    public UploadComplianceDocumentCommandValidator()
    {
        RuleFor(x => x.GroupId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.FileName).NotEmpty().MaximumLength(255);
        RuleFor(x => x.ContentType).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Data).NotNull().Must(d => d.Length > 0).WithMessage("Document content is required");
    }
}
