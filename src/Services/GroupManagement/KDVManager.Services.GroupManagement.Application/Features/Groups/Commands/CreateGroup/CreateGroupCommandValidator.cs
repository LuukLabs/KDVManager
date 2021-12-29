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
                .MaximumLength(25)
                .MustAsync(GroupNameUnique).WithErrorCode("Not unique");
        }

        private async Task<bool> GroupNameUnique(string name, CancellationToken token)
        {
            return !(await _groupRepository.IsNameUnique(name));
        }
    }
}
