using FluentValidation;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.ArchiveChild;

public class ArchiveChildCommandValidator : AbstractValidator<ArchiveChildCommand>
{
    public ArchiveChildCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Child Id is required");
    }
}
