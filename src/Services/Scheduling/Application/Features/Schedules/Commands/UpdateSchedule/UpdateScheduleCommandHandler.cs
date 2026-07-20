using System;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Contracts.Services;
using KDVManager.Shared.Application.Exceptions;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.UpdateSchedule;

public class UpdateScheduleCommandHandler
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly ITimeSlotRepository _timeSlotRepository;
    private readonly IGroupRepository _groupRepository;
    private readonly IScheduleStatusService _scheduleStatusService;

    public UpdateScheduleCommandHandler(
        IScheduleRepository scheduleRepository,
        ITimeSlotRepository timeSlotRepository,
        IGroupRepository groupRepository,
        IScheduleStatusService scheduleStatusService)
    {
        _scheduleRepository = scheduleRepository;
        _timeSlotRepository = timeSlotRepository;
        _groupRepository = groupRepository;
        _scheduleStatusService = scheduleStatusService;
    }

    public async Task<Guid> Handle(Guid id, UpdateScheduleCommand request)
    {
        // This lookup uses the tenant query filter. A schedule belonging to another
        // tenant is intentionally indistinguishable from a non-existent schedule.
        var schedule = await _scheduleRepository.GetWithRulesByIdAsync(id);
        if (schedule == null)
        {
            throw new NotFoundException(nameof(Schedule), id);
        }

        var validator = new UpdateScheduleCommandValidator(
            _timeSlotRepository,
            _groupRepository,
            _scheduleRepository,
            schedule.ChildId,
            schedule.Id);
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult);
        }

        schedule.StartDate = request.StartDate;
        var replacementRules = request.ScheduleRules.Select(rule => new ScheduleRule
        {
            Id = Guid.NewGuid(),
            ScheduleId = schedule.Id,
            Day = rule.Day,
            TimeSlotId = rule.TimeSlotId,
            GroupId = rule.GroupId
        }).ToList();

        // Rules, start date and calculated end dates are all committed in one
        // transaction. There is no observable delete-then-create or stale-timeline gap.
        await _scheduleRepository.ReplaceRulesAndRecalculateAsync(schedule, replacementRules);
        await _scheduleStatusService.PublishStatusForChildAsync(schedule.ChildId);

        return schedule.Id;
    }
}
