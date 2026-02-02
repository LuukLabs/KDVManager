using System;
using System.ComponentModel.DataAnnotations;
using KDVManager.Shared.Contracts.Enums;

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
        /// The current scheduling status of this child based on their activity intervals.
        /// </summary>
        [property: Required]
        public required ChildSchedulingStatus SchedulingStatus { get; set; }

        /// <summary>
        /// For Active status: the end date of the current interval.
        /// For Upcoming status: the start date of the next interval.
        /// Null otherwise.
        /// </summary>
        public DateOnly? StatusRelevantDate { get; set; }
    }
}
