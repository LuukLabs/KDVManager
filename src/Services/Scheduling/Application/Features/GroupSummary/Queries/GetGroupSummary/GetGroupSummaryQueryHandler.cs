using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.BKRCalculator;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.GroupSummary.Queries.GetGroupSummary;

public class GetGroupSummaryQueryHandler
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IChildRepository _childRepository;
    private readonly ITimeSlotRepository _timeSlotRepository;
    private readonly IGroupRepository _groupRepository;

    public GetGroupSummaryQueryHandler(
        IScheduleRepository scheduleRepository,
        IChildRepository childRepository,
        ITimeSlotRepository timeSlotRepository,
        IGroupRepository groupRepository)
    {
        _scheduleRepository = scheduleRepository;
        _childRepository = childRepository;
        _timeSlotRepository = timeSlotRepository;
        _groupRepository = groupRepository;
    }

    public async Task<GroupSummaryVM> Handle(GetGroupSummaryQuery request)
    {
        var group = await _groupRepository.GetByIdAsync(request.GroupId)
                   ?? throw new ArgumentException($"Group with ID {request.GroupId} not found");

        var schedules = await _scheduleRepository.GetSchedulesByDateAsync(request.Date, request.GroupId);

        var scheduleRules = ExtractScheduleRules(schedules, request);
        var children = await LoadChildrenAsync(schedules);

        var timeBlocksIntervals = GetExactTimeBlocks(scheduleRules);

        // Haal ALLE TimeSlots één keer op, niet per interval
        var allTimeSlots = await _timeSlotRepository.ListAllAsync();

        var timeBlocks = new List<TimeBlockSummary>();

        foreach (var tb in timeBlocksIntervals)
        {
            var name = DetermineTimeBlockName(tb.Start, tb.End, allTimeSlots.ToList());
            var summary = BuildTimeBlockSummary(tb.Start, tb.End, scheduleRules, children, request.Date, name);
            timeBlocks.Add(summary);
        }

        timeBlocks = timeBlocks.OrderBy(tb => tb.StartTime).ToList();

        var maxProfessionals = timeBlocks.Any() ? timeBlocks.Max(tb => tb.RequiredProfessionals) : 0;

        return new GroupSummaryVM
        {
            GroupId = request.GroupId,
            GroupName = group.Name,
            Date = request.Date,
            TimeBlocks = timeBlocks,
            RequiredProfessionals = maxProfessionals,
            NumberOfChildren = children.Count()
        };
    }

    private static List<ScheduleRule> ExtractScheduleRules(IEnumerable<Schedule> schedules, GetGroupSummaryQuery request)
    {
        return schedules
            .SelectMany(s => s.ScheduleRules)
            .Where(sr => sr.Day == request.Date.DayOfWeek && sr.GroupId == request.GroupId)
            .ToList();
    }

    private async Task<List<Child>> LoadChildrenAsync(IEnumerable<Schedule> schedules)
    {
        var childIds = schedules.Select(s => s.ChildId).Distinct().ToList();
        return await _childRepository.GetChildrenByIdsAsync(childIds);
    }

    private static List<(TimeOnly Start, TimeOnly End)> GetExactTimeBlocks(List<ScheduleRule> scheduleRules)
    {
        var timePoints = scheduleRules
            .SelectMany(sr => new[] { sr.TimeSlot.StartTime, sr.TimeSlot.EndTime })
            .Distinct()
            .OrderBy(t => t)
            .ToList();

        var result = new List<(TimeOnly Start, TimeOnly End)>();

        for (int i = 0; i < timePoints.Count - 1; i++)
        {
            var start = timePoints[i];
            var end = timePoints[i + 1];

            var exists = scheduleRules.Any(sr => sr.TimeSlot.StartTime <= start && sr.TimeSlot.EndTime >= end);
            if (exists)
                result.Add((start, end));
        }

        return result;
    }

    // TimeSlot naam op basis van reeds opgehaalde lijst
    private static string DetermineTimeBlockName(TimeOnly start, TimeOnly end, List<TimeSlot> allTimeSlots)
    {
        var exactMatch = allTimeSlots.FirstOrDefault(ts => ts.StartTime == start && ts.EndTime == end);
        return exactMatch?.Name ?? "-";
    }

    private TimeBlockSummary BuildTimeBlockSummary(TimeOnly start, TimeOnly end, List<ScheduleRule> scheduleRules, List<Child> children, DateOnly date, string timeSlotName)
    {
        var overlappingRules = scheduleRules
            .Where(sr => sr.TimeSlot.StartTime <= start && sr.TimeSlot.EndTime >= end)
            .ToList();

        var childrenInBlock = children
            .Where(c => overlappingRules.Any(r => r.Schedule.ChildId == c.Id))
            .ToList();

        var ageGroups = CalculateAgeGroups(childrenInBlock, date);
        var totalChildren = childrenInBlock.Count;
        var result = CalculateRequiredSupervisors(totalChildren, ageGroups);

        return new TimeBlockSummary
        {
            StartTime = start,
            EndTime = end,
            TimeSlotName = timeSlotName,
            TotalChildren = totalChildren,
            RequiredProfessionals = result.HasSolution ? result.Professionals : -1,
            AgeGroups = ageGroups
        };
    }

    private static List<AgeGroupSummary> CalculateAgeGroups(List<Child> children, DateOnly date)
    {
        var withAges = children.Select(c => new { c, Age = CalculateAge(c.DateOfBirth, date) }).ToList();

        return new[]
        {
            new AgeGroupSummary { AgeRange = "0-1 years", ChildCount = withAges.Count(a => a.Age < 1) },
            new AgeGroupSummary { AgeRange = "1-2 years", ChildCount = withAges.Count(a => a.Age >= 1 && a.Age < 2) },
            new AgeGroupSummary { AgeRange = "2-3 years", ChildCount = withAges.Count(a => a.Age >= 2 && a.Age < 3) },
            new AgeGroupSummary { AgeRange = "3-4 years", ChildCount = withAges.Count(a => a.Age >= 3 && a.Age < 4) },
            new AgeGroupSummary { AgeRange = "4+ years", ChildCount = withAges.Count(a => a.Age >= 4) }
        }.Where(g => g.ChildCount > 0).ToList();
    }

    private static int CalculateAge(DateOnly birthDate, DateOnly reference)
    {
        var age = reference.Year - birthDate.Year;
        if (reference < birthDate.AddYears(age))
            age--;
        return age;
    }

    private static GroupAnalysisResult CalculateRequiredSupervisors(int totalChildren, List<AgeGroupSummary> groups)
    {
        int Count(string range) => groups.FirstOrDefault(g => g.AgeRange == range)?.ChildCount ?? 0;

        var ageGroupCounts = new AgeGroupCounts();
        ageGroupCounts.Age0Count = Count("0-1 years");
        ageGroupCounts.Age1Count = Count("1-2 years");
        ageGroupCounts.Age2Count = Count("2-3 years");
        ageGroupCounts.Age3Count = Count("3-4 years");

        var groupAnalyzer = new GroupAnalyzer();
        return groupAnalyzer.CalculateBKR(ageGroupCounts);
    }
}
