using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using KDVManager.Services.Scheduling.Domain.Entities;
using System.Linq;

namespace KDVManager.Services.Scheduling.Application.Features.ClosurePeriods.Queries.ListClosurePeriods;

public class ListClosurePeriodsQueryHandler
{
    private readonly IClosurePeriodRepository _repository;
    public ListClosurePeriodsQueryHandler(IClosurePeriodRepository repository)
    {
        _repository = repository;
    }
    public async Task<List<ClosurePeriodListVM>> Handle(ListClosurePeriodsQuery query)
    {
        var closurePeriods = await _repository.ListAllAsync();
        List<ClosurePeriodListVM> closurePeriodListVMs = closurePeriods.Select(closurePeriod => new ClosurePeriodListVM
        {
            Id = closurePeriod.Id,
            StartDate = closurePeriod.StartDate,
            EndDate = closurePeriod.EndDate,
            Reason = closurePeriod.Reason
        }).ToList();

        return closurePeriodListVMs;
    }
}
