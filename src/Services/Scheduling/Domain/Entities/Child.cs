using System;
using KDVManager.Services.Scheduling.Domain.Interfaces;

namespace KDVManager.Services.Scheduling.Domain.Entities
{
    public class Child : IMustHaveTenant
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public DateOnly DateOfBirth { get; set; }
        public string GivenName { get; set; } = string.Empty;
        public string FamilyName { get; set; } = string.Empty;

        public int Age(DateOnly? asOf = null)
        {
            var date = asOf ?? DateOnly.FromDateTime(DateTime.Today);
            var age = date.Year - DateOfBirth.Year;
            if (DateOfBirth > date.AddYears(-age)) age--;
            return age < 0 ? 0 : age;
        }
    }
}
