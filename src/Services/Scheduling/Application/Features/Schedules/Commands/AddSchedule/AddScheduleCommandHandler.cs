using System;
using System.Text.Json;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.AddSchedule;

public class AddScheduleCommandHandler
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly ITimeSlotRepository _timeSlotRepository;

    public AddScheduleCommandHandler(IScheduleRepository scheduleRepository, ITimeSlotRepository timeSlotRepository)
    {
        _scheduleRepository = scheduleRepository;
        _timeSlotRepository = timeSlotRepository;
    }

    public async Task<Guid> Handle(AddScheduleCommand request)
    {
        var validator = new AddScheduleCommandValidator(_timeSlotRepository);
        var validationResult = await validator.ValidateAsync(request);

        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult);

        var schedule = new Schedule
        {
            Id = Guid.NewGuid(),
            ChildId = request.ChildId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
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

        return schedule.Id;
    }
}

