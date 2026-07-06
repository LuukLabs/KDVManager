using FluentValidation;

namespace KDVManager.Services.CRM.Application.Features.Administrators.Commands.CreateAdministrator;

public class CreateAdministratorCommandValidator : AbstractValidator<CreateAdministratorCommand>
{
    public CreateAdministratorCommandValidator()
    {
        RuleFor(p => p.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(p => p.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);
    }
}
