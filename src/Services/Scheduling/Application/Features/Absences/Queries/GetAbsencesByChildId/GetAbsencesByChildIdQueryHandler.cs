using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.Absences.Queries.GetAbsencesByChildId;

public class GetAbsencesByChildIdQueryHandler
{
    private readonly IAbsenceRepository _repository;
    public GetAbsencesByChildIdQueryHandler(IAbsenceRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Absence>> Handle(GetAbsencesByChildIdQuery query)
    {
        return await _repository.GetByChildIdAsync(query.ChildId);
    }
}
