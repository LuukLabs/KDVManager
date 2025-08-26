using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.TimeSlots.Commands.UpdateTimeSlot;

public class UpdateTimeSlotCommandHandler
{
    private readonly ITimeSlotRepository _timeSlotRepository;

    public UpdateTimeSlotCommandHandler(ITimeSlotRepository timeSlotRepository)
    {
        _timeSlotRepository = timeSlotRepository;
    }

    public async Task Handle(UpdateTimeSlotCommand request)
    {
        var validator = new UpdateTimeSlotCommandValidator(_timeSlotRepository);
        var validationResult = await validator.ValidateAsync(request);

        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult);

        var timeSlot = await _timeSlotRepository.GetByIdAsync(request.Id);

        if (timeSlot == null)
            throw new Exceptions.NotFoundException(nameof(Domain.Entities.TimeSlot), request.Id);

        timeSlot.Name = request.Name;
        timeSlot.StartTime = request.StartTime;
        timeSlot.EndTime = request.EndTime;

        await _timeSlotRepository.UpdateAsync(timeSlot);
    }
}
