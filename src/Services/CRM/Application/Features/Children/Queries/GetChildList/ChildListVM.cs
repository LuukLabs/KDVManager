using System;
using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList
{
    public class ChildListVM
    {
        [property: Required]
        public required Guid Id { get; set; }

        [property: Required]
        public required string FullName { get; set; }

        [property: Required]
        public required DateOnly DateOfBirth { get; set; }

        public DateTime? ArchivedAt { get; set; }
    }
}
