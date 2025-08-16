using System;
using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetGuardianList
{
    public class GuardianListVM
    {
        [property: Required]
        public required Guid Id { get; set; }

        [property: Required]
        public required string FullName { get; set; }

        [property: Required]
        public string? Email { get; set; }

        [property: Required]
        public string? PrimaryPhoneNumber { get; set; }
        public int PhoneNumberCount { get; set; }

        public int ChildrenCount { get; set; }
    }
}
