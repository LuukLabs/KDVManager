using FluentValidation;

namespace KDVManager.Services.CRM.Application.Features.People.Commands.AddPerson;

public class AddPersonCommandValidator : AbstractValidator<AddPersonCommand>
{
    public AddPersonCommandValidator()
    {
        RuleFor(p => p.GivenName)
            .NotEmpty()
            .NotNull()
            .MaximumLength(25);

        RuleFor(p => p.FamilyName)
            .NotEmpty()
            .NotNull()
            .MaximumLength(25);
    }
}

