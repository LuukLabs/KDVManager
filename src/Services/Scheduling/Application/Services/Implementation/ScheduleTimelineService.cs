using System;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Services;
using KDVManager.Services.Scheduling.Domain.Services;

namespace KDVManager.Services.Scheduling.Application.Services.Implementation;

public class ScheduleTimelineService : IScheduleTimelineService
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IEndMarkRepository _endMarkRepository;

    public ScheduleTimelineService(IScheduleRepository scheduleRepository, IEndMarkRepository endMarkRepository)
    {
        _scheduleRepository = scheduleRepository;
        _endMarkRepository = endMarkRepository;
    }

    public async Task RecalculateAsync(Guid childId)
    {
        var schedules = (await _scheduleRepository.GetSchedulesByChildIdAsync(childId))
            .OrderBy(s => s.StartDate)
            .ToList();
        var endMarks = (await _endMarkRepository.GetByChildIdAsync(childId)).ToList();
        ScheduleEndDateCalculator.Recalculate(schedules, endMarks);
        // Schedules updated in memory; repository/base context should track and persist on next unit of work
        // If explicit persistence needed, expose a SaveChanges method in a unit of work abstraction.
    }
}
