using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Application.Services;

namespace KDVManager.Services.Scheduling.Application.Features.Absences.Commands.AddAbsence;

public class AddAbsenceCommandHandler
{
    private readonly IAbsenceRepository _repository;
    private readonly IScheduleRepository _scheduleRepository;
    private readonly ICalendarRowInvalidationService _invalidationService;
    public AddAbsenceCommandHandler(IAbsenceRepository repository, IScheduleRepository scheduleRepository, ICalendarRowInvalidationService invalidationService)
    {
        _repository = repository;
        _scheduleRepository = scheduleRepository;
        _invalidationService = invalidationService;
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

        // Invalidate group caches for groups the child is scheduled in during period
        var schedules = await _scheduleRepository.GetSchedulesByChildIdAsync(command.ChildId);
        var groups = schedules.SelectMany(s => s.ScheduleRules).Select(r => r.GroupId).Distinct();
        var start = command.StartDate;
        var end = command.EndDate;
        foreach (var g in groups)
            await _invalidationService.InvalidateGroupRangeAsync(g, start, end);
        return absence.Id;
    }
}
