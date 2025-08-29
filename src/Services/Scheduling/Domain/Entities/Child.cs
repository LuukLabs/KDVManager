using System;
using KDVManager.Services.Scheduling.Domain.Interfaces;
using KDVManager.Shared.Domain.Interfaces;

namespace KDVManager.Services.Scheduling.Domain.Entities
{
    public class Child : IMustHaveTenant, IHasDateOfBirth
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public DateOnly DateOfBirth { get; set; }
        public string GivenName { get; set; } = string.Empty;
        public string FamilyName { get; set; } = string.Empty;

    }
}
