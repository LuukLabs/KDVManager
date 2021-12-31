using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using KDVManager.Services.ChildManagement.Application.Contracts.Persistence;

namespace KDVManager.Services.ChildManagement.Application.Features.Children.Commands.CreateChild
{
    public class CreateChildCommandValidator : AbstractValidator<CreateChildCommand>
    {
        public CreateChildCommandValidator()
        {
            RuleFor(p => p.GivenName)
                .NotEmpty()
                .NotNull()
                .MaximumLength(25);
        }
    }
}
