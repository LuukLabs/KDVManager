﻿using System;

namespace KDVManager.Services.CRM.Application.Features.People.Commands.AddPerson
{
    public class AddPersonCommand
    {
        public string GivenName { get; set; }

        public string FamilyName { get; set; }

        public DateTime DateOfBirth { get; set; }

        public string Email { get; set; }

        public string BSN { get; set; }

        public string PhoneNumber { get; set; }
    }
}
