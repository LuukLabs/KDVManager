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

        public string CID { get; set; }

        public DateOnly DateOfBirth { get; set; }

        public DateTime? ArchivedAt { get; private set; }

        public bool Archive()
        {
            if (ArchivedAt.HasValue)
                return false;

            ArchivedAt = DateTime.UtcNow;
            return true;
        }
    }
}
