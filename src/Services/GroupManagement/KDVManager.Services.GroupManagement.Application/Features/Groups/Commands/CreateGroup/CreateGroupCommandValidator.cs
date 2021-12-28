using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using KDVManager.Services.GroupManagement.Application.Contracts.Persistence;

namespace KDVManager.Services.GroupManagement.Application.Features.Groups.Commands.CreateGroup
{
    public class CreateGroupCommandValidator : AbstractValidator<CreateGroupCommand>
    {
        private readonly IGroupRepository _groupRepository;

        public CreateGroupCommandValidator(IGroupRepository groupRepository)
        {
            _groupRepository = groupRepository;

            RuleFor(p => p.Name)
                .NotEmpty()
                .NotNull()
                .MaximumLength(25);

            RuleFor(e => e)
                .MustAsync(GroupNameUnique);
        }

        private async Task<bool> GroupNameUnique(CreateGroupCommand e, CancellationToken token)
        {
            return !(await _groupRepository.IsNameUnique(e.Name));
        }
    }
}
