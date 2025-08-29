using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Services;

namespace KDVManager.Services.Scheduling.Application.Features.Absences.Commands.DeleteAbsence;

public class DeleteAbsenceCommandHandler
{
    private readonly IAbsenceRepository _repository;
    private readonly IScheduleRepository _scheduleRepository;
    private readonly ICalendarRowInvalidationService _invalidationService;
    public DeleteAbsenceCommandHandler(IAbsenceRepository repository, IScheduleRepository scheduleRepository, ICalendarRowInvalidationService invalidationService)
    {
        _repository = repository;
        _scheduleRepository = scheduleRepository;
        _invalidationService = invalidationService;
    }
    public async Task Handle(DeleteAbsenceCommand command)
    {
        var absence = await _repository.GetByIdAsync(command.Id);
        if (absence == null) return;

        await _repository.DeleteAsync(absence);
        var schedules = await _scheduleRepository.GetSchedulesByChildIdAsync(absence.ChildId);
        var groups = schedules.SelectMany(s => s.ScheduleRules).Select(r => r.GroupId).Distinct();
        var start = absence.StartDate;
        var end = absence.EndDate;
        foreach (var g in groups)
            await _invalidationService.InvalidateGroupRangeAsync(g, start, end);
    }
}

