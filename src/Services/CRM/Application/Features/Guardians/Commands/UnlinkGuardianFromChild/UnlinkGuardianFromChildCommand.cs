using System;
using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Commands.UnlinkGuardianFromChild
{
    public class UnlinkGuardianFromChildCommand
    {
        [property: Required]
        public Guid ChildId { get; set; }

        [property: Required]
        public Guid GuardianId { get; set; }
    }
}
