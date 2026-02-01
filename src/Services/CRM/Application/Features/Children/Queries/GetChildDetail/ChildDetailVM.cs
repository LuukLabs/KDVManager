using System;
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
        /// Indicates whether this child currently has an active schedule.
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// The end date of the last active schedule, if applicable.
        /// </summary>
        public DateOnly? LastActiveDate { get; set; }
    }
}
