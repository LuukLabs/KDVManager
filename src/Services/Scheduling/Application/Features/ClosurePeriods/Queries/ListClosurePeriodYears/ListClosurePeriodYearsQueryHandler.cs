using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.ClosurePeriods.Queries.ListClosurePeriodYears;

public class ListClosurePeriodYearsQueryHandler
{
    private readonly IClosurePeriodRepository _repository;
    public ListClosurePeriodYearsQueryHandler(IClosurePeriodRepository repository)
    {
        _repository = repository;
    }
    public async Task<List<int>> Handle(ListClosurePeriodYearsQuery query)
    {
        var closurePeriods = await _repository.ListAllAsync();
        return closurePeriods
            .Select(cd => cd.StartDate.Year)
            .Distinct()
            .OrderBy(y => y)
            .ToList();
    }
}
