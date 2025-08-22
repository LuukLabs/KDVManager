using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Features.GroupSummary.Queries.GetGroupSummary;
using KDVManager.BKRCalculator;

namespace KDVManager.Services.Scheduling.Application.Features.LongTermPlanning.Queries.GetLongTermPlanning;

public class GetLongTermPlanningQueryHandler
{
    private readonly GetGroupSummaryQueryHandler _groupSummaryHandler;

    public GetLongTermPlanningQueryHandler(GetGroupSummaryQueryHandler groupSummaryHandler)
    {
        _groupSummaryHandler = groupSummaryHandler;
    }

    public async Task<LongTermPlanningVM> Handle(GetLongTermPlanningQuery request)
    {
        var days = Math.Clamp(request.Days <= 0 ? 28 : request.Days, 1, 90);

        var results = new List<PlanningDayVM>(days);

        for (int i = 0; i < days; i++)
        {
            var date = request.StartDate.AddDays(i);
            GroupSummaryVM? groupSummary = null;
            if (request.GroupId.HasValue)
            {
                groupSummary = await _groupSummaryHandler.Handle(new GetGroupSummaryQuery
                {
                    GroupId = request.GroupId.Value,
                    Date = date
                });
            }

            // For now only per-group scenario; aggregation across groups could be added later.
            var timeBlocks = (groupSummary?.TimeBlocks ?? new List<TimeBlockSummary>())
                .Select(tb => MapTimeBlock(tb))
                .ToList();

            results.Add(new PlanningDayVM
            {
                Date = date,
                TimeBlocks = timeBlocks
            });
        }

        return new LongTermPlanningVM
        {
            StartDate = request.StartDate,
            Days = days,
            DaysData = results
        };
    }

    private static PlanningTimeBlockVM MapTimeBlock(TimeBlockSummary tb)
    {
        var professionals = tb.RequiredProfessionals >= 0 ? tb.RequiredProfessionals : 0;
        var baseChildren = tb.TotalChildren;

        // Derive age group counts for calculator
        var ageCounts = new AgeGroupCounts();
        int Count(string range) => tb.AgeGroups.FirstOrDefault(g => g.AgeRange == range)?.ChildCount ?? 0;
        ageCounts.Age0Count = Count("0-1 years");
        ageCounts.Age1Count = Count("1-2 years");
        ageCounts.Age2Count = Count("2-3 years");
        ageCounts.Age3Count = Count("3-4 years");

        var analyzer = new GroupAnalyzer();
        // Original solution result
        var originalResult = analyzer.CalculateBKR(ageCounts);

        var ageAddOptions = new List<AgeAddOptionVM>();

        // For each age bucket attempt to add one child of that bucket and recalc.
        var ageRanges = new[] { "0-1 years", "1-2 years", "2-3 years", "3-4 years", "4+ years" };
        foreach (var range in ageRanges)
        {
            var modified = new AgeGroupCounts
            {
                Age0Count = ageCounts.Age0Count,
                Age1Count = ageCounts.Age1Count,
                Age2Count = ageCounts.Age2Count,
                Age3Count = ageCounts.Age3Count
            };
            switch (range)
            {
                case "0-1 years": modified.Age0Count++; break;
                case "1-2 years": modified.Age1Count++; break;
                case "2-3 years": modified.Age2Count++; break;
                case "3-4 years": modified.Age3Count++; break;
                // 4+ years not represented in calculator counts; treat as Age3 for ratio neutrality
                case "4+ years": modified.Age3Count++; break;
            }
            var addResult = analyzer.CalculateBKR(modified);
            var option = new AgeAddOptionVM
            {
                AgeRange = range,
                CanAddWithCurrentStaff = addResult.HasSolution && addResult.Professionals == originalResult.Professionals,
                CanAddWithOneExtraStaff = addResult.HasSolution && addResult.Professionals == originalResult.Professionals + 1,
                AdditionalProfessionalsNeeded = addResult.HasSolution ? addResult.Professionals - originalResult.Professionals : -1,
                ResultingProfessionals = addResult.HasSolution ? addResult.Professionals : -1
            };
            ageAddOptions.Add(option);
        }

        // Capacity heuristic improved: capacity with extra supervisor = base children + count of age ranges addable with <=1 extra professional.
        var addableSameStaff = ageAddOptions.Count(o => o.CanAddWithCurrentStaff);
        var addableWithOne = ageAddOptions.Count(o => !o.CanAddWithCurrentStaff && o.CanAddWithOneExtraStaff);
        var capacityCurrent = baseChildren + addableSameStaff; // theoretical immediate add space
        var capacityWithExtra = baseChildren + addableSameStaff + addableWithOne;

        return new PlanningTimeBlockVM
        {
            StartTime = tb.StartTime,
            EndTime = tb.EndTime,
            TimeSlotName = tb.TimeSlotName,
            TotalChildren = baseChildren,
            RequiredProfessionals = professionals,
            CapacityCurrent = capacityCurrent,
            CapacityWithExtraSupervisor = capacityWithExtra,
            OriginalHasSolution = originalResult.HasSolution,
            AgeGroups = tb.AgeGroups,
            AgeAddOptions = ageAddOptions
        };
    }
}
