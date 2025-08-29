using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Services;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.ClosurePeriods.Commands.AddClosurePeriod;

public class AddClosurePeriodCommandHandler
{
    private readonly IClosurePeriodRepository _repository;
    private readonly ICalendarRowInvalidationService _invalidationService;
    private readonly IGroupRepository _groupRepository;
    public AddClosurePeriodCommandHandler(IClosurePeriodRepository repository, ICalendarRowInvalidationService invalidationService, IGroupRepository groupRepository)
    {
        _repository = repository;
        _invalidationService = invalidationService;
        _groupRepository = groupRepository;
    }
    public async Task<Guid> Handle(AddClosurePeriodCommand command)
    {
        var closurePeriod = new ClosurePeriod
        {
            Id = Guid.NewGuid(),
            StartDate = command.StartDate,
            EndDate = command.EndDate,
            Reason = command.Reason
        };
        await _repository.AddAsync(closurePeriod);
        // Invalidate affected date range for all groups (closure is global)
        var groups = await _groupRepository.ListAllAsync();
        foreach (var g in groups)
            await _invalidationService.InvalidateGroupRangeAsync(g.Id, closurePeriod.StartDate, closurePeriod.EndDate);
        return closurePeriod.Id;
    }
}
