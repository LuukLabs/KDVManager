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
        public DateTime? ArchivedAt { get; set; }
    }
}
