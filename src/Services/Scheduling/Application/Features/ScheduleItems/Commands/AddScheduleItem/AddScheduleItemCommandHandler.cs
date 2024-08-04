using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.ScheduleItems.Commands.AddScheduleItem;

public class AddScheduleItemCommandHandler : IRequestHandler<AddScheduleItemCommand, Guid>
{
    private readonly IScheduleItemRepository _scheduleItemRepository;
    private readonly IMapper _mapper;

    public AddScheduleItemCommandHandler(IScheduleItemRepository scheduleItemRepository, IMapper mapper)
    {
        _scheduleItemRepository = scheduleItemRepository;
        _mapper = mapper;
    }

    public async Task<Guid> Handle(AddScheduleItemCommand request, CancellationToken cancellationToken)
    {
        var validator = new AddScheduleItemCommandValidator(_scheduleItemRepository);
        var validationResult = await validator.ValidateAsync(request);

        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult);

        var scheduleItem = _mapper.Map<ScheduleItem>(request);

        scheduleItem = await _scheduleItemRepository.AddAsync(scheduleItem);

        return scheduleItem.Id;
    }
}

