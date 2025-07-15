using System.Threading.Tasks;
using FluentValidation;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Exceptions;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Commands.DeleteGroup;

public class DeleteGroupCommandHandler
{
    private readonly IGroupRepository _groupRepository;
    private readonly IScheduleRepository _scheduleRepository;

    public DeleteGroupCommandHandler(IGroupRepository groupRepository, IScheduleRepository scheduleRepository)
    {
        _groupRepository = groupRepository;
        _scheduleRepository = scheduleRepository;
    }

    public async Task Handle(DeleteGroupCommand request)
    {
        var group = await _groupRepository.GetByIdAsync(request.Id) ?? throw new NotFoundException(nameof(Group), request.Id);

        var validator = new DeleteGroupCommandValidator(_scheduleRepository);
        var validationResult = await validator.ValidateAsync(request);

        if (!validationResult.IsValid)
            throw new ConflictException(nameof(Group), request.Id);

        await _groupRepository.DeleteAsync(group);
    }
}
