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

        [property: Required]
        public required int ChildNumber { get; set; }

        /// <summary>
        /// Indicates whether this child currently has an active schedule.
        /// </summary>
        [property: Required]
        public required bool IsActive { get; set; }

        /// <summary>
        /// The end date of the last active schedule, if applicable.
        /// </summary>
        public DateOnly? LastActiveDate { get; set; }
    }
}
