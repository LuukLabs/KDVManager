using System;
using System.Text.Json;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
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
    private readonly ICalendarRowInvalidationService _invalidationService;

    public AddScheduleCommandHandler(IScheduleRepository scheduleRepository, ITimeSlotRepository timeSlotRepository, IScheduleTimelineService timelineService, ICalendarRowInvalidationService invalidationService)
    {
        _scheduleRepository = scheduleRepository;
        _timeSlotRepository = timeSlotRepository;
        _timelineService = timelineService;
        _invalidationService = invalidationService;
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
            StartDate = request.StartDate,
            TenantId = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f") // Default tenant ID for now
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

        // Invalidate only affected date range for each involved group
        var groupIds = schedule.ScheduleRules.Select(r => r.GroupId).Distinct();
        var start = schedule.StartDate;
        // New schedule has unknown end until timeline recalculation; assume 180-day planning horizon or timeline will extend later.
        var end = schedule.ScheduleRules.Any() ? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(180)) : start;
        foreach (var gid in groupIds)
            await _invalidationService.InvalidateGroupRangeAsync(gid, start, end);

        return schedule.Id;
    }
}

