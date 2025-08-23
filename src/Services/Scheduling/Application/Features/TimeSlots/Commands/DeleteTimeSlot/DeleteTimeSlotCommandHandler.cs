using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.TimeSlots.Commands.DeleteTimeSlot;

public class DeleteTimeSlotCommandHandler
{
    private readonly ITimeSlotRepository _timeSlotRepository;

    public DeleteTimeSlotCommandHandler(ITimeSlotRepository timeSlotRepository)
    {
        _timeSlotRepository = timeSlotRepository;
    }

    public async Task Handle(DeleteTimeSlotCommand request)
    {
        if (!await _timeSlotRepository.ExistsAsync(request.Id))
            throw new Exceptions.NotFoundException(nameof(Domain.Entities.TimeSlot), request.Id);

        if (await _timeSlotRepository.IsInUseAsync(request.Id))
            throw new Exceptions.ConflictException(nameof(Domain.Entities.TimeSlot), request.Id);

        var entity = await _timeSlotRepository.GetByIdAsync(request.Id);
        await _timeSlotRepository.DeleteAsync(entity);
    }
}
