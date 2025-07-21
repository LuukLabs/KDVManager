using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.Children.Commands.DeleteChild;

public class DeleteChildCommandHandler
{
    private readonly IChildRepository _childRepository;
    private readonly IScheduleRepository _scheduleRepository;

    public DeleteChildCommandHandler(IChildRepository childRepository, IScheduleRepository scheduleRepository)
    {
        _childRepository = childRepository;
        _scheduleRepository = scheduleRepository;
    }

    public async Task Handle(DeleteChildCommand command)
    {
        var child = await _childRepository.GetByIdAsync(command.Id);
        if (child == null) return;

        // Delete schedules associated with the child
        await _scheduleRepository.DeleteSchedulesByChildIdAsync(command.Id);

        await _childRepository.DeleteAsync(child);
    }
};
