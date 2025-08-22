using System;
using System.Collections.Generic;
using KDVManager.Services.Scheduling.Application.Features.GroupSummary.Queries.GetGroupSummary;

namespace KDVManager.Services.Scheduling.Application.Features.LongTermPlanning.Queries.GetLongTermPlanning;

public class LongTermPlanningVM
{
    public required DateOnly StartDate { get; set; }
    public required int Days { get; set; }
    public required List<PlanningDayVM> DaysData { get; set; } = new();
}

public class PlanningDayVM
{
    public required DateOnly Date { get; set; }
    public required List<PlanningTimeBlockVM> TimeBlocks { get; set; } = new();
}

public class PlanningTimeBlockVM
{
    public required TimeOnly StartTime { get; set; }
    public required TimeOnly EndTime { get; set; }
    public required string TimeSlotName { get; set; } = string.Empty;
    public required int TotalChildren { get; set; }
    public required int RequiredProfessionals { get; set; }
    public int CapacityCurrent { get; set; }
    public int CapacityWithExtraSupervisor { get; set; }
    public int SpotsCurrent => CapacityCurrent - TotalChildren;
    public int SpotsWithExtraSupervisor => CapacityWithExtraSupervisor - TotalChildren;
    public bool OriginalHasSolution { get; set; }
    public List<AgeGroupSummary> AgeGroups { get; set; } = new();
    public List<AgeAddOptionVM> AgeAddOptions { get; set; } = new();
}

public class AgeAddOptionVM
{
    public string AgeRange { get; set; } = string.Empty;
    public bool CanAddWithCurrentStaff { get; set; }
    public bool CanAddWithOneExtraStaff { get; set; }
    public int AdditionalProfessionalsNeeded { get; set; }
    public int ResultingProfessionals { get; set; }
}
