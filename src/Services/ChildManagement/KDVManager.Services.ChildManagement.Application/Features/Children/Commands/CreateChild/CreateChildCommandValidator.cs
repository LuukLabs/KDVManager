using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using KDVManager.Services.ChildManagement.Application.Contracts.Persistence;

namespace KDVManager.Services.ChildManagement.Application.Features.Children.Commands.CreateChild
{
    public class CreateChildCommandValidator : AbstractValidator<CreateChildCommand>
    {
        private readonly IChildRepository _childRepository;

        public CreateChildCommandValidator(IChildRepository childRepository)
        {
            _childRepository = childRepository;

            RuleFor(p => p.Name)
                .NotEmpty()
                .NotNull()
                .MaximumLength(25);
        }
    }
}
