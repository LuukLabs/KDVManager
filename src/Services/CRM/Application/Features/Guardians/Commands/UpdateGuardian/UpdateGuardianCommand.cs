using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Commands.UpdateGuardian
{
    public class UpdateGuardianCommand
    {
        [property: Required]
        public Guid Id { get; set; }

        [property: Required]
        public string GivenName { get; set; } = string.Empty;

        [property: Required]
        public string FamilyName { get; set; } = string.Empty;

        [property: Required]
        public DateOnly DateOfBirth { get; set; }

        [property: Required]
        public string Email { get; set; } = string.Empty;
        public List<UpdatePhoneNumberDto> PhoneNumbers { get; set; } = new();
    }


    public class UpdatePhoneNumberDto
    {
        public Guid? Id { get; set; } // Null for new phone numbers
        public string Number { get; set; } = string.Empty; // Raw input, will normalize to E.164
        public PhoneNumberType Type { get; set; }
    }
}
