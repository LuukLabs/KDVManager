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
    }
}
