using System;
using KDVManager.Shared.Contracts.Enums;

namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildDetail
{
    public class ChildDetailVM
    {
        public Guid Id { get; set; }
        public required string GivenName { get; set; }

        public required string FamilyName { get; set; }

        public DateOnly DateOfBirth { get; set; }

        public string? CID { get; set; }

        /// <summary>
        /// Unique identification number for this child within the tenant.
        /// This number is automatically assigned and incremental per tenant.
        /// </summary>
        public int ChildNumber { get; set; }

        /// <summary>
        /// The current scheduling status of this child based on their activity intervals.
        /// </summary>
        public ChildSchedulingStatus SchedulingStatus { get; set; }

        /// <summary>
        /// For Active status: the end date of the current interval.
        /// For Upcoming status: the start date of the next interval.
        /// Null otherwise.
        /// </summary>
        public DateOnly? StatusRelevantDate { get; set; }
    }
}
