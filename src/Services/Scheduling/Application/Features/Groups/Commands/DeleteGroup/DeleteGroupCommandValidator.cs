using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Commands.DeleteGroup;

public class DeleteGroupCommandValidator : AbstractValidator<DeleteGroupCommand>
{
    private readonly IScheduleRepository _scheduleRepository;

    public DeleteGroupCommandValidator(IScheduleRepository scheduleRepository)
    {
        _scheduleRepository = scheduleRepository;

        RuleFor(deleteGroupCommand => deleteGroupCommand.Id)
            .MustAsync(GroupNotInUse)
            .WithErrorCode("GDU001")
            .WithMessage("The group is currently in use and cannot be deleted.");
    }

    private async Task<bool> GroupNotInUse(Guid groupId, CancellationToken token)
    {
        return !await _scheduleRepository.IsGroupUsedAsync(groupId);
    }
}
