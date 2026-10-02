using System.ComponentModel.DataAnnotations;
using KDVManager.Shared.Contracts.Enums;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class UpdateWaitlistEntryStatusCommand
{
    [Required]
    public WaitlistEntryStatus? Status { get; init; }
    [Required]
    public Guid? Revision { get; init; }
}
