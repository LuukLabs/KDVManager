using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.Absences.Commands.AddAbsence;

public class AddAbsenceCommandHandler
{
    private readonly IAbsenceRepository _repository;
    public AddAbsenceCommandHandler(IAbsenceRepository repository)
    {
        _repository = repository;
    }
    public async Task<Guid> Handle(AddAbsenceCommand command)
    {
        var absence = new Absence
        {
            Id = Guid.NewGuid(),
            ChildId = command.ChildId,
            StartDate = command.StartDate,
            EndDate = command.EndDate,
            Reason = command.Reason
        };
        await _repository.AddAsync(absence);
        return absence.Id;
    }
}
