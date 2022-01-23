using System;
using KDVManager.Services.ChildManagement.Domain.Interfaces;

namespace KDVManager.Services.ChildManagement.Domain.Entities
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
