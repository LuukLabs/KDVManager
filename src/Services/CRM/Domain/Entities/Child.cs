using System;
using KDVManager.Services.CRM.Domain.Interfaces;

namespace KDVManager.Services.CRM.Domain.Entities
{
    public class Child : IMustHaveTenant
    {
        public Guid Id { get; set; }

        public Guid TenantId { get; set; }

        public string GivenName { get; set; }

        public string FamilyName { get; set; }

        public DateTime DateOfBirth { get; set; }
    }
}
