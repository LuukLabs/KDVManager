using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Exceptions;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.DeleteSchedule;

public class DeleteScheduleCommandHandler
{
    private readonly IScheduleRepository _scheduleRepository;

    public DeleteScheduleCommandHandler(IScheduleRepository scheduleRepository)
    {
        _scheduleRepository = scheduleRepository;
    }

    public async Task Handle(DeleteScheduleCommand request)
    {
        var scheduleToDelete = await _scheduleRepository.GetByIdAsync(request.Id);

        if (scheduleToDelete == null)
        {
            throw new NotFoundException(nameof(Schedule), request.Id);
        }

        await _scheduleRepository.DeleteAsync(scheduleToDelete);
    }
}
