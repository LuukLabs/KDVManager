using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.Scheduling.Application.Features.TimeSlots.Commands.AddTimeSlot;

public class AddTimeSlotCommandHandler
{
    private readonly ITimeSlotRepository _timeSlotRepository;
    private readonly ITenancyContextAccessor _tenancyContextAccessor;

    public AddTimeSlotCommandHandler(ITimeSlotRepository timeSlotRepository, ITenancyContextAccessor tenancyContextAccessor)
    {
        _timeSlotRepository = timeSlotRepository;
        _tenancyContextAccessor = tenancyContextAccessor;
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
            TenantId = _tenancyContextAccessor.Current!.TenantId
        };

        timeSlot = await _timeSlotRepository.AddAsync(timeSlot);

        return timeSlot.Id;
    }
}

