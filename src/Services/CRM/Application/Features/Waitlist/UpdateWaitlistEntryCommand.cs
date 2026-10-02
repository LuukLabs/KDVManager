using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class UpdateWaitlistEntryCommand : CreateWaitlistEntryCommand
{
    [Required]
    public Guid? Revision { get; init; }
}
