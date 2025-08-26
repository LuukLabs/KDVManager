using System;
using KDVManager.Services.CRM.Domain.Interfaces;

namespace KDVManager.Services.CRM.Domain.Entities
{
    public class Child : IMustHaveTenant
    {
        public Guid Id { get; set; }

        public Guid TenantId { get; set; }

        public required string GivenName { get; set; }

        public required string FamilyName { get; set; }

        public string? CID { get; set; }

        public DateOnly DateOfBirth { get; set; }

        /// <summary>
        /// Unique identification number for this child within the tenant.
        /// This number is automatically assigned and cannot be changed manually.
        /// Numbers are incremental starting from 1 per tenant.
        /// </summary>
        public int ChildNumber { get; set; }
    }
}
