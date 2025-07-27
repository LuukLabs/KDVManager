using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.ClosurePeriods.Commands.DeleteClosurePeriod;

public class DeleteClosurePeriodCommandHandler
{
    private readonly IClosurePeriodRepository _repository;
    public DeleteClosurePeriodCommandHandler(IClosurePeriodRepository repository)
    {
        _repository = repository;
    }
    public async Task Handle(DeleteClosurePeriodCommand command)
    {
        var closurePeriod = await _repository.GetByIdAsync(command.Id);
        if (closurePeriod == null) return;
        await _repository.DeleteAsync(closurePeriod);
    }
}
