using FluentValidation;

namespace KDVManager.Services.CRM.Application.Features.Administrators.Commands.InviteAdministrator;

public class InviteAdministratorCommandValidator : AbstractValidator<InviteAdministratorCommand>
{
    public InviteAdministratorCommandValidator()
    {
        RuleFor(p => p.Email)
            .NotEmpty()
            .NotNull()
            .EmailAddress()
            .MaximumLength(254);
    }
}
