using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Services;

namespace KDVManager.Services.Scheduling.Application.Features.ClosurePeriods.Commands.DeleteClosurePeriod;

public class DeleteClosurePeriodCommandHandler
{
    private readonly IClosurePeriodRepository _repository;
    private readonly ICalendarRowInvalidationService _invalidationService;
    private readonly IGroupRepository _groupRepository;
    public DeleteClosurePeriodCommandHandler(IClosurePeriodRepository repository, ICalendarRowInvalidationService invalidationService, IGroupRepository groupRepository)
    {
        _repository = repository;
        _invalidationService = invalidationService;
        _groupRepository = groupRepository;
    }
    public async Task Handle(DeleteClosurePeriodCommand command)
    {
        var closurePeriod = await _repository.GetByIdAsync(command.Id);
        if (closurePeriod == null) return;
        await _repository.DeleteAsync(closurePeriod);
        // Invalidate affected date range for all groups
        var groups = await _groupRepository.ListAllAsync();
        foreach (var g in groups)
            await _invalidationService.InvalidateGroupRangeAsync(g.Id, closurePeriod.StartDate, closurePeriod.EndDate);
    }
}
