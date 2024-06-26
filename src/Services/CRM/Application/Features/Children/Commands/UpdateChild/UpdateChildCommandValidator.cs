using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using KDVManager.Services.CRM.Application.Contracts.Persistence;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.UpdateChild;

public class UpdateChildCommandValidator : AbstractValidator<UpdateChildCommand>
{
    public UpdateChildCommandValidator()
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
