using System.ComponentModel.DataAnnotations;
using KDVManager.Shared.Contracts.Enums;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class CreateWaitlistEntryCommand
{
    [Required]
    public string? GivenName { get; init; }

    [Required]
    public string? FamilyName { get; init; }

    [Required]
    public DateOnly? DateOfBirth { get; init; }

    [Required]
    public DateOnly? DesiredStartDate { get; init; }

    [Required]
    public string? ContactName { get; init; }

    [Required]
    public string? ContactEmail { get; init; }

    public string? ContactPhone { get; init; }
    public string? RequestedDays { get; init; }
    public string? Notes { get; init; }
    public string? Location { get; init; }
    public ChildcareType? CareType { get; init; }
    public string? PreferredGroup { get; init; }
    /// <summary>Scheduling day numbers: Sunday = 0, Monday = 1, through Saturday = 6.</summary>
    public int[] Weekdays { get; init; } = [];
    public TimeOnly? StartTime { get; init; }
    public TimeOnly? EndTime { get; init; }
    public int Priority { get; init; }
    public string? PriorityReason { get; init; }
    public string? PriorityExplanation { get; init; }

}
