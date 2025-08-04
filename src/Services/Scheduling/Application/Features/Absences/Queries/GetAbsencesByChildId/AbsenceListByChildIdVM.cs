using System;

namespace KDVManager.Services.Scheduling.Application.Features.Absences.Queries.GetAbsencesByChildId;

public class AbsenceListByChildIdVM
{
    public required Guid Id { get; set; }
    public required DateOnly StartDate { get; set; }
    public required DateOnly EndDate { get; set; }
    public required string Reason { get; set; } = string.Empty;
}

