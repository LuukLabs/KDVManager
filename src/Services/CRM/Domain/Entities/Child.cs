using System;
using KDVManager.Services.CRM.Domain.Interfaces;
using KDVManager.Shared.Domain.Interfaces;

namespace KDVManager.Services.CRM.Domain.Entities
{
    public class Child : IMustHaveTenant, IHasDateOfBirth
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

        /// <summary>
        /// Indicates whether this child currently has an active schedule.
        /// A child is considered active when they have at least one schedule where
        /// today's date falls between the StartDate and EndDate (or EndDate is null).
        /// This value is synchronized from the Scheduling service.
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// The end date of the last active schedule, if applicable.
        /// Null if the child has no schedules or the latest schedule is open-ended.
        /// This value is synchronized from the Scheduling service.
        /// </summary>
        public DateOnly? LastActiveDate { get; set; }

    }
}
