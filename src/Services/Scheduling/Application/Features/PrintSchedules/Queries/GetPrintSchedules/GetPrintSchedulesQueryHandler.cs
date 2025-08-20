using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.PrintSchedules.Queries.GetPrintSchedules;

public class GetPrintSchedulesQueryHandler
{
    private readonly IGroupRepository _groupRepository;
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IChildRepository _childRepository;
    private readonly IAbsenceRepository _absenceRepository;
    private readonly IClosurePeriodRepository _closurePeriodRepository;

    public GetPrintSchedulesQueryHandler(
        IGroupRepository groupRepository,
        IScheduleRepository scheduleRepository,
        IChildRepository childRepository,
        IAbsenceRepository absenceRepository,
        IClosurePeriodRepository closurePeriodRepository)
    {
        _groupRepository = groupRepository;
        _scheduleRepository = scheduleRepository;
        _childRepository = childRepository;
        _absenceRepository = absenceRepository;
        _closurePeriodRepository = closurePeriodRepository;
    }

    public async Task<PrintSchedulesVM> Handle(GetPrintSchedulesQuery request)
    {
        var monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(request.Month);

        List<Guid>? filterIds = null;
        if (request.GroupIds != null && request.GroupIds.Any())
        {
            filterIds = request.GroupIds;
        }
        else if (request.GroupId.HasValue)
        {
            filterIds = new List<Guid> { request.GroupId.Value };
        }

        var groups = filterIds != null
            ? (await _groupRepository.GetGroupsByIdsAsync(filterIds)).ToList()
            : (await _groupRepository.ListAllAsync()).ToList();

        var closurePeriods = await _closurePeriodRepository.ListByYearAsync(request.Year);

        var result = new PrintSchedulesVM
        {
            Month = monthName,
            Year = request.Year
        };

        foreach (var group in groups.OrderBy(g => g.Name))
        {
            var groupVm = new PrintGroupVM
            {
                Id = group.Id,
                Name = group.Name
            };

            // Build pages per weekday (Monday-Friday typical; use all 7 days if needed)
            foreach (DayOfWeek dow in Enum.GetValues(typeof(DayOfWeek)))
            {
                // Skip weekend if not needed; keep for completeness now
                var datesForWeekday = GetDatesForWeekdayInMonth(request.Year, request.Month, dow);
                if (datesForWeekday.Count == 0) continue;

                // Get schedules for each date individually (could be optimized with batch query if needed)
                var childEntries = new Dictionary<Guid, PrintChildVM>();

                foreach (var date in datesForWeekday)
                {
                    var schedules = await _scheduleRepository.GetSchedulesByDateAsync(date, group.Id);
                    var childIds = schedules.Select(s => s.ChildId).Distinct().ToList();
                    var children = await _childRepository.GetChildrenByIdsAsync(childIds);

                    // Build dictionary for absences for these children
                    var absenceLookups = new Dictionary<Guid, List<Absence>>();
                    foreach (var childId in childIds)
                    {
                        // naive per child fetch; could optimize later with batch method
                        var childAbsences = await _absenceRepository.GetByChildIdAsync(childId);
                        absenceLookups[childId] = childAbsences;
                    }

                    var isClosed = closurePeriods.Any(cp => cp.StartDate <= date && cp.EndDate >= date);

                    foreach (var schedule in schedules)
                    {
                        var child = children.FirstOrDefault(c => c.Id == schedule.ChildId);
                        if (child == null) continue;
                        if (!childEntries.TryGetValue(child.Id, out var childVm))
                        {
                            childVm = new PrintChildVM
                            {
                                Id = child.Id,
                                GivenName = child.GivenName,
                                FamilyName = child.FamilyName,
                                DateOfBirth = child.DateOfBirth
                            };
                            childEntries[child.Id] = childVm;
                        }

                        // For this date, collect schedule rules for this weekday and group
                        var rulesForDay = schedule.ScheduleRules.Where(sr => sr.Day == dow && sr.GroupId == group.Id).ToList();
                        if (!rulesForDay.Any()) continue;

                        var earliestStart = rulesForDay.Min(r => r.TimeSlot.StartTime);
                        var latestEnd = rulesForDay.Max(r => r.TimeSlot.EndTime);

                        var key = date.ToString("yyyy-MM-dd");
                        if (!childVm.Schedule.ContainsKey(key))
                        {
                            var cell = new PrintCellVM();
                            if (isClosed)
                            {
                                cell.Status = "closed";
                            }
                            else
                            {
                                // Determine absence
                                var childAbsences = absenceLookups[child.Id];
                                var absence = childAbsences.FirstOrDefault(a => a.StartDate <= date && a.EndDate >= date);
                                if (absence != null)
                                {
                                    cell.Status = "absence";
                                    cell.AbsenceType = absence.Reason; // simple mapping for now
                                }
                                else
                                {
                                    cell.Status = "scheduled";
                                }
                            }
                            if (earliestStart != default && latestEnd != default)
                            {
                                cell.StartTime = earliestStart.ToString("HH:mm");
                                cell.EndTime = latestEnd.ToString("HH:mm");
                            }
                            childVm.Schedule[key] = cell;
                        }
                    }
                }

                if (childEntries.Any())
                {
                    var page = new PrintGroupWeekdayPageVM
                    {
                        Weekday = dow,
                        Dates = datesForWeekday,
                        Children = childEntries.Values
                            .OrderBy(c => c.Name)
                            .ToList()
                    };
                    groupVm.Pages.Add(page);
                }
            }

            if (groupVm.Pages.Any())
            {
                result.Groups.Add(groupVm);
            }
        }

        return result;
    }

    private static List<DateOnly> GetDatesForWeekdayInMonth(int year, int month, DayOfWeek weekday)
    {
        var dates = new List<DateOnly>();
        var daysInMonth = DateTime.DaysInMonth(year, month);
        for (int day = 1; day <= daysInMonth; day++)
        {
            var date = new DateOnly(year, month, day);
            if (date.DayOfWeek == weekday)
                dates.Add(date);
        }
        return dates;
    }
}
