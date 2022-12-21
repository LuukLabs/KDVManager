using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using KDVManager.Services.Scheduling.Application.Contracts.Infrastructure;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Commands.AddGroup;

public class AddGroupCommandValidator : AbstractValidator<AddGroupCommand>
{
    public AddGroupCommandValidator()
    {
        RuleFor(p => p.Name)
            .NotEmpty()
            .NotNull()
            .MaximumLength(25);
    }
}
