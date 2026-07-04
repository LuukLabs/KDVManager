using System;
using System.Text.Json;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Contracts.Services;
using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.Extensions.Logging;
using System.Linq;
using KDVManager.Services.Scheduling.Application.Services;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.AddSchedule;

public class AddScheduleCommandHandler
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly ITimeSlotRepository _timeSlotRepository;
    private readonly IScheduleTimelineService _timelineService;
    private readonly IScheduleStatusService _scheduleStatusService;

    public AddScheduleCommandHandler(
        IScheduleRepository scheduleRepository,
        ITimeSlotRepository timeSlotRepository,
        IScheduleTimelineService timelineService,
        IScheduleStatusService scheduleStatusService)
    {
        _scheduleRepository = scheduleRepository;
        _timeSlotRepository = timeSlotRepository;
        _timelineService = timelineService;
        _scheduleStatusService = scheduleStatusService;
    }

    public async Task<Guid> Handle(AddScheduleCommand request)
    {
        var validator = new AddScheduleCommandValidator(_timeSlotRepository, _scheduleRepository);
        var validationResult = await validator.ValidateAsync(request);

        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult);


        var schedule = new Schedule
        {
            Id = Guid.NewGuid(),
            ChildId = request.ChildId,
            StartDate = request.StartDate
        };

        // Create schedule rules
        if (request.ScheduleRules != null)
        {
            schedule.ScheduleRules = request.ScheduleRules.Select(rule => new ScheduleRule
            {
                Id = Guid.NewGuid(),
                ScheduleId = schedule.Id,
                Day = rule.Day,
                TimeSlotId = rule.TimeSlotId,
                GroupId = rule.GroupId
            }).ToList();
        }

        schedule = await _scheduleRepository.AddAsync(schedule);

        // Recalculate timeline to set EndDates appropriately
        await _timelineService.RecalculateAsync(schedule.ChildId);

        // Publish schedule status change event
        await _scheduleStatusService.PublishStatusForChildAsync(schedule.ChildId);

        return schedule.Id;
    }
}
