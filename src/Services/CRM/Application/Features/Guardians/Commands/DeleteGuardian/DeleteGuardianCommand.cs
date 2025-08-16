using System;
using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Commands.DeleteGuardian
{
    public class DeleteGuardianCommand
    {
        [property: Required]
        public Guid Id { get; set; }
    }
}
