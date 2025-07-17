using FluentValidation;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.AddChild;

public class AddChildCommandValidator : AbstractValidator<AddChildCommand>
{
    public AddChildCommandValidator()
    {
        RuleFor(p => p.GivenName)
            .NotEmpty()
            .NotNull()
            .MaximumLength(25);

        RuleFor(p => p.FamilyName)
            .NotEmpty()
            .NotNull()
            .MaximumLength(25);

        RuleFor(p => p.DateOfBirth)
            .NotEmpty()
            .NotNull();

        RuleFor(p => p.CID)
            .MaximumLength(25);
    }
}
