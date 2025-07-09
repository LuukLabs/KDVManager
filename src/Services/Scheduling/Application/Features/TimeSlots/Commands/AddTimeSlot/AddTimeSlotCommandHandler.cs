using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.TimeSlots.Commands.AddTimeSlot;

public class AddTimeSlotCommandHandler
{
    private readonly ITimeSlotRepository _timeSlotRepository;

    public AddTimeSlotCommandHandler(ITimeSlotRepository timeSlotRepository)
    {
        _timeSlotRepository = timeSlotRepository;
    }

    public async Task<Guid> Handle(AddTimeSlotCommand request)
    {
        var validator = new AddTimeSlotCommandValidator(_timeSlotRepository);
        var validationResult = await validator.ValidateAsync(request);

        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult);

        var timeSlot = new TimeSlot
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            TenantId = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f") // Default tenant ID for now
        };

        timeSlot = await _timeSlotRepository.AddAsync(timeSlot);

        return timeSlot.Id;
    }
}

