using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Features.ClosurePeriods.Queries.ListClosurePeriods;
using KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetSchedulesByDate;

namespace KDVManager.Services.Scheduling.Application.Features.Overview.Queries.GetDailyOverview;

public class GetDailyOverviewQueryHandler
{
    private readonly GetSchedulesByDateQueryHandler _getSchedulesByDateQueryHandler;
    private readonly ListClosurePeriodsQueryHandler _listClosurePeriodsQueryHandler;
    private readonly IAbsenceRepository _absenceRepository;
    private readonly IGroupRepository _groupRepository;

    public GetDailyOverviewQueryHandler(
        GetSchedulesByDateQueryHandler getSchedulesByDateQueryHandler,
        ListClosurePeriodsQueryHandler listClosurePeriodsQueryHandler,
        IAbsenceRepository absenceRepository,
        IGroupRepository groupRepository)
    {
        _getSchedulesByDateQueryHandler = getSchedulesByDateQueryHandler;
        _listClosurePeriodsQueryHandler = listClosurePeriodsQueryHandler;
        _absenceRepository = absenceRepository;
        _groupRepository = groupRepository;
    }

    public async Task<DailyOverviewVM> Handle(GetDailyOverviewQuery query)
    {
        var date = query.Date;

        // Determine closure
        var closurePeriods = await _listClosurePeriodsQueryHandler.Handle(new ListClosurePeriodsQuery());
        var closure = closurePeriods.FirstOrDefault(cp => date >= cp.StartDate && date <= cp.EndDate);

        // Load all groups (for now show all groups even if empty)
        var groups = await _groupRepository.ListAllAsync();

        // Fetch schedules per group sequentially to avoid concurrent DbContext usage issues
        var groupSchedules = new List<(Domain.Entities.Group Group, List<ScheduleByDateVM> Schedules)>();
        foreach (var g in groups)
        {
            var schedulesForGroup = await _getSchedulesByDateQueryHandler.Handle(new GetSchedulesByDateQuery { Date = date, GroupId = g.Id });
            groupSchedules.Add((g, schedulesForGroup));
        }

        // Collect child IDs for absence lookup
        var childIds = groupSchedules.SelectMany(gs => gs.Schedules).Select(s => s.ChildId).Distinct().ToList();
        var allAbsences = await _absenceRepository.GetByChildIdsAsync(childIds);
        var absencesByChild = allAbsences
            .GroupBy(a => a.ChildId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var overview = new DailyOverviewVM
        {
            Date = date,
            IsClosed = closure != null,
            ClosureReason = closure?.Reason
        };

        foreach (var gs in groupSchedules)
        {
            var groupVm = new GroupDailyOverviewVM
            {
                GroupId = gs.Group.Id,
                GroupName = gs.Group.Name,
                Schedules = gs.Schedules.Select(s =>
                        {
                            var absence = absencesByChild.TryGetValue(s.ChildId, out var list)
                                ? list.FirstOrDefault(a => date >= a.StartDate && date <= a.EndDate)
                                : null;
                            return new ChildScheduleDailyVM
                            {
                                ScheduleId = s.ScheduleId,
                                ChildId = s.ChildId,
                                TimeSlotName = s.TimeSlotName,
                                StartTime = s.StartTime,
                                EndTime = s.EndTime,
                                DateOfBirth = s.DateOfBirth,
                                Age = s.Age,
                                IsAbsent = absence != null,
                                AbsenceReason = absence?.Reason
                            };
                        }).ToList()
            };
            overview.Groups.Add(groupVm);
        }

        return overview;
    }
}
