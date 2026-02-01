using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Contracts.Services;
using KDVManager.Services.Scheduling.Application.Exceptions;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Application.Services;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.DeleteSchedule;

public class DeleteScheduleCommandHandler
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IScheduleTimelineService _timelineService;
    private readonly IScheduleStatusService _scheduleStatusService;

    public DeleteScheduleCommandHandler(
        IScheduleRepository scheduleRepository,
        IScheduleTimelineService timelineService,
        IScheduleStatusService scheduleStatusService)
    {
        _scheduleRepository = scheduleRepository;
        _timelineService = timelineService;
        _scheduleStatusService = scheduleStatusService;
    }

    public async Task Handle(DeleteScheduleCommand request)
    {
        var scheduleToDelete = await _scheduleRepository.GetByIdAsync(request.Id);

        if (scheduleToDelete == null)
        {
            throw new NotFoundException(nameof(Schedule), request.Id);
        }

        var childId = scheduleToDelete.ChildId;
        await _scheduleRepository.DeleteAsync(scheduleToDelete);
        await _timelineService.RecalculateAsync(childId);

        // Publish schedule status change event
        await _scheduleStatusService.PublishStatusForChildAsync(childId);
    }
}
