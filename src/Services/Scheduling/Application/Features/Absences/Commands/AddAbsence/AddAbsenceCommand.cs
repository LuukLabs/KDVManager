using System;

namespace KDVManager.Services.Scheduling.Application.Features.Absences.Commands.AddAbsence;

public class AddAbsenceCommand
{
    public Guid ChildId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string? Reason { get; set; }
}

