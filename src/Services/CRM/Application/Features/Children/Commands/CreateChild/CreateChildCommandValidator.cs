using FluentValidation;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.CreateChild;

public class CreateChildCommandValidator : AbstractValidator<CreateChildCommand>
{
    public CreateChildCommandValidator()
    {
        RuleFor(p => p.GivenName)
            .NotEmpty()
            .NotNull()
            .MaximumLength(25);

        RuleFor(p => p.FamilyName)
            .NotEmpty()
            .NotNull()
            .MaximumLength(25);

        RuleFor(p => p.CID)
            .MaximumLength(25);
    }
}
