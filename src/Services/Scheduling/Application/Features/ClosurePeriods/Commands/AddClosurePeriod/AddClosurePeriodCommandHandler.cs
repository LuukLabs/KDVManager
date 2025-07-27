using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.ClosurePeriods.Commands.AddClosurePeriod;

public class AddClosurePeriodCommandHandler
{
    private readonly IClosurePeriodRepository _repository;
    public AddClosurePeriodCommandHandler(IClosurePeriodRepository repository)
    {
        _repository = repository;
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
        return closurePeriod.Id;
    }
}
