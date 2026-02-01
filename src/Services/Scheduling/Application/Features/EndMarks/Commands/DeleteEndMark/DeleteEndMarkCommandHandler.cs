using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Contracts.Services;
using KDVManager.Services.Scheduling.Application.Exceptions;
using KDVManager.Services.Scheduling.Application.Services;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.EndMarks.Commands.DeleteEndMark;

public class DeleteEndMarkCommandHandler
{
    private readonly IEndMarkRepository _repo;
    private readonly IScheduleTimelineService _timeline;
    private readonly IScheduleStatusService _scheduleStatusService;

    public DeleteEndMarkCommandHandler(
        IEndMarkRepository repo,
        IScheduleTimelineService timeline,
        IScheduleStatusService scheduleStatusService)
    {
        _repo = repo;
        _timeline = timeline;
        _scheduleStatusService = scheduleStatusService;
    }

    public async Task Handle(DeleteEndMarkCommand request)
    {
        var mark = await _repo.GetByIdAsync(request.Id);
        if (mark == null)
        {
            throw new NotFoundException(nameof(EndMark), request.Id);
        }

        var childId = mark.ChildId;

        await _repo.DeleteAsync(mark);
        await _timeline.RecalculateAsync(childId);

        // Publish schedule status change event
        await _scheduleStatusService.PublishStatusForChildAsync(childId);
    }
}
