using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.TimeSlots.Commands.AddTimeSlot;

public class AddTimeSlotCommandHandler : IRequestHandler<AddTimeSlotCommand, Guid>
{
    private readonly ITimeSlotRepository _timeSlotRepository;
    private readonly IMapper _mapper;

    public AddTimeSlotCommandHandler(ITimeSlotRepository timeSlotRepository, IMapper mapper)
    {
        _timeSlotRepository = timeSlotRepository;
        _mapper = mapper;
    }

    public async Task<Guid> Handle(AddTimeSlotCommand request, CancellationToken cancellationToken)
    {
        var validator = new AddTimeSlotCommandValidator(_timeSlotRepository);
        var validationResult = await validator.ValidateAsync(request);

        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult);

        var timeSlot = _mapper.Map<TimeSlot>(request);

        timeSlot = await _timeSlotRepository.AddAsync(timeSlot);

        return timeSlot.Id;
    }
}

