using System;

namespace KDVManager.Services.CRM.Domain.Entities
{
    public class Child
    {
        public Guid Id { get; set; }

        public string GivenName { get; set; }

        public string FamilyName { get; set; }

        public DateTime? DateOfBirth { get; set; }
    }
}
