using System.ComponentModel.DataAnnotations;

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
}
