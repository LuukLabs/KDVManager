using System;
using System.Collections.Generic;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Commands.AddGuardian
{
    public class AddGuardianCommand
    {
        public string GivenName { get; set; } = string.Empty;
        public string FamilyName { get; set; } = string.Empty;
        public DateOnly DateOfBirth { get; set; }
        public string Email { get; set; } = string.Empty;
        public List<AddPhoneNumberDto> PhoneNumbers { get; set; } = new();
    }

    public class AddPhoneNumberDto
    {
        public string Number { get; set; } = string.Empty; // Accept raw, will normalize to E.164
        public PhoneNumberType Type { get; set; }
    }
}
