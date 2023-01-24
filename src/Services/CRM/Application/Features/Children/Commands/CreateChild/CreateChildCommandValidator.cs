using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using KDVManager.Services.CRM.Application.Contracts.Persistence;

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
    }
}
