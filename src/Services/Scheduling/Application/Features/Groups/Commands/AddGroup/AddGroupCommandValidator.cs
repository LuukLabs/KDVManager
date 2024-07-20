using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Commands.AddGroup;

public class AddGroupCommandValidator : AbstractValidator<AddGroupCommand>
{
    private readonly IGroupRepository _groupRepository;

    public AddGroupCommandValidator(IGroupRepository groupRepository)
    {
        _groupRepository = groupRepository;

        RuleFor(addGroupCommand => addGroupCommand.Name)
            .NotEmpty()
            .NotNull()
            .MaximumLength(25);

        RuleFor(addGroupCommand => addGroupCommand.Name)
            .MustAsync(GroupNameUnique)
            .WithErrorCode("GNU001")
            .WithMessage("An group with the same name already exists.");
    }

    private async Task<bool> GroupNameUnique(string name, CancellationToken token)
    {
        return !(await _groupRepository.IsGroupNameUnique(name));
    }
}
