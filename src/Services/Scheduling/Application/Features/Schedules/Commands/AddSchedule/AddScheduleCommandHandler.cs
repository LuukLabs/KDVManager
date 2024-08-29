using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.AddSchedule;

public class AddScheduleCommandHandler : IRequestHandler<AddScheduleCommand, Guid>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IMapper _mapper;

    public AddScheduleCommandHandler(IScheduleRepository scheduleRepository, IMapper mapper)
    {
        _scheduleRepository = scheduleRepository;
        _mapper = mapper;
    }

    public async Task<Guid> Handle(AddScheduleCommand request, CancellationToken cancellationToken)
    {
        var validator = new AddScheduleCommandValidator();
        var validationResult = await validator.ValidateAsync(request);

        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult);

        var schedule = _mapper.Map<Schedule>(request);

        schedule = await _scheduleRepository.AddAsync(schedule);

        return schedule.Id;
    }
}

