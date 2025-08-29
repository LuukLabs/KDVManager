using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Features.ClosurePeriods.Queries.ListClosurePeriods;
using KDVManager.Services.Scheduling.Application.Services; // For ICalendarRowQueryService

namespace KDVManager.Services.Scheduling.Application.Features.Overview.Queries.GetDailyOverview;

public class GetDailyOverviewQueryHandler
{
    private readonly ListClosurePeriodsQueryHandler _listClosurePeriodsQueryHandler;
    private readonly IGroupRepository _groupRepository;
    private readonly ICalendarRowQueryService _calendarRowQueryService;

    public GetDailyOverviewQueryHandler(
        ListClosurePeriodsQueryHandler listClosurePeriodsQueryHandler,
        IGroupRepository groupRepository,
        ICalendarRowQueryService calendarRowQueryService)
    {
        _listClosurePeriodsQueryHandler = listClosurePeriodsQueryHandler;
        _groupRepository = groupRepository;
        _calendarRowQueryService = calendarRowQueryService;
    }

    public async Task<DailyOverviewVM> Handle(GetDailyOverviewQuery query)
    {
        var date = query.Date;

        // Determine closure (still authoritative source for full-day closure)
        var closurePeriods = await _listClosurePeriodsQueryHandler.Handle(new ListClosurePeriodsQuery());
        var closure = closurePeriods.FirstOrDefault(cp => date >= cp.StartDate && date <= cp.EndDate);

        // Load all groups to show even if empty
        var groups = await _groupRepository.ListAllAsync();

        var overview = new DailyOverviewVM
        {
            Date = date,
            IsClosed = closure != null,
            ClosureReason = closure?.Reason
        };

        // CACHED IMPLEMENTATION NOTE
        // This handler now sources its data from the persistent CalendarRowCache
        // via ICalendarRowQueryService. That service ensures rows exist (recalculating
        // on demand) and denormalizes child age, birthday, absence and closure status.
        // Therefore we intentionally removed direct schedule + absence queries to
        // reduce per-request DB load. Invalidation is handled by calendar row
        // invalidation services and background warming.
        // For each group, retrieve cached calendar rows for the single date
        foreach (var g in groups)
        {
            var rows = await _calendarRowQueryService.GetRowsAsync(g.Id, date, date);

            // Map rows to schedule view models. CalendarRowCache already contains absence/closed status.
            var scheduleVms = rows
                .Where(r => r.Status == "present" || r.Status == "absent") // skip pure 'closed' rows for child listing
                .Select(r => new ChildScheduleDailyVM
                {
                    // ScheduleId not stored in cache currently; use deterministic composite surrogate (row Id) to keep non-empty
                    ScheduleId = r.Id,
                    ChildId = r.ChildId,
                    TimeSlotName = r.SlotName,
                    StartTime = r.StartTime,
                    EndTime = r.EndTime,
                    DateOfBirth = r.Birthday,
                    Age = r.Age,
                    IsAbsent = r.Status == "absent",
                    AbsenceReason = r.Status == "absent" ? r.Reason : null
                })
                .OrderBy(s => s.StartTime)
                .ThenBy(s => s.ChildId)
                .ToList();

            overview.Groups.Add(new GroupDailyOverviewVM
            {
                GroupId = g.Id,
                GroupName = g.Name,
                Schedules = scheduleVms
            });
        }

        return overview;
    }
}
