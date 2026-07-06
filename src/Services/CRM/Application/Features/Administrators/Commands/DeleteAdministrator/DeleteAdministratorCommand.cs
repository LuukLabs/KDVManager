using System;
using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.CRM.Application.Features.Administrators.Commands.DeleteAdministrator
{
    public class DeleteAdministratorCommand
    {
        [property: Required]
        public Guid Id { get; set; }
    }
}
