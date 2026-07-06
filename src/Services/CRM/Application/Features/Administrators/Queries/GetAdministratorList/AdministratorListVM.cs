using System;
using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.CRM.Application.Features.Administrators.Queries.GetAdministratorList
{
    public class AdministratorListVM
    {
        [property: Required]
        public required Guid Id { get; set; }

        [property: Required]
        public required string Name { get; set; }

        [property: Required]
        public required string Email { get; set; }

        [property: Required]
        public required DateTime CreatedAt { get; set; }
    }
}
