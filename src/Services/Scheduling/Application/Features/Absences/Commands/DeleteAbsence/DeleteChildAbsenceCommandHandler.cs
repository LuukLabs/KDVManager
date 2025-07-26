using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.Absences.Commands.DeleteAbsence;

public class DeleteAbsenceCommandHandler
{
    private readonly IAbsenceRepository _repository;
    public DeleteAbsenceCommandHandler(IAbsenceRepository repository)
    {
        _repository = repository;
    }
    public async Task Handle(DeleteAbsenceCommand command)
    {
        var absence = await _repository.GetByIdAsync(command.Id);
        if (absence == null) return;

        await _repository.DeleteAsync(absence);
    }
}

