using System;

namespace KDVManager.Services.Scheduling.Application.Features.EndMarks.Commands.AddEndMark;

public class AddEndMarkCommand
{
    public Guid ChildId { get; set; }
    public DateOnly EndDate { get; set; }
    public string? Reason { get; set; }
}
