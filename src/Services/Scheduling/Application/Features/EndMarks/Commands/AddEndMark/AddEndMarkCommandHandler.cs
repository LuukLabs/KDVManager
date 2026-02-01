using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Contracts.Services;
using KDVManager.Services.Scheduling.Application.Services;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.EndMarks.Commands.AddEndMark;

public class AddEndMarkCommandHandler
{
    private readonly IEndMarkRepository _repo;
    private readonly IScheduleTimelineService _timeline;
    private readonly IScheduleStatusService _scheduleStatusService;

    public AddEndMarkCommandHandler(
        IEndMarkRepository repo,
        IScheduleTimelineService timeline,
        IScheduleStatusService scheduleStatusService)
    {
        _repo = repo;
        _timeline = timeline;
        _scheduleStatusService = scheduleStatusService;
    }

    public async Task Handle(AddEndMarkCommand request)
    {
        var validator = new AddEndMarkCommandValidator(_repo);
        var validationResult = await validator.ValidateAsync(request);

        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult);

        var endMark = new EndMark(request.ChildId, request.EndDate, request.Reason);
        await _repo.AddAsync(endMark);
        await _timeline.RecalculateAsync(request.ChildId);

        // Publish schedule status change event
        await _scheduleStatusService.PublishStatusForChildAsync(request.ChildId);
    }
}
