using System;
using System.Collections.Generic;
using System.Linq;
using KDVManager.Services.CRM.Domain.Interfaces;
using KDVManager.Shared.Contracts.Enums;
using KDVManager.Shared.Domain.Interfaces;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.CRM.Domain.Entities
{
    public class Child : IMustHaveTenant, IHasDateOfBirth
    {
        public Guid Id { get; set; }

        public Guid TenantId { get; set; }

        public required string GivenName { get; set; }

        public required string FamilyName { get; set; }

        public DateOnly DateOfBirth { get; set; }

        /// <summary>
        /// Unique identification number for this child within the tenant.
        /// This number is automatically assigned and cannot be changed manually.
        /// Numbers are incremental starting from 1 per tenant.
        /// </summary>
        public int ChildNumber { get; set; }

        /// <summary>
        /// Known allergies for this child (free text).
        /// </summary>
        public string? Allergies { get; set; }

        /// <summary>
        /// Regular medication for this child (free text).
        /// </summary>
        public string? Medication { get; set; }

        /// <summary>
        /// Dietary requirements or preferences for this child (free text).
        /// </summary>
        public string? DietaryRequirements { get; set; }

        /// <summary>
        /// Additional medical notes or other extra information for this child (free text).
        /// </summary>
        public string? MedicalNotes { get; set; }

        /// <summary>
        /// Activity intervals representing periods when this child has scheduled attendance.
        /// These are synchronized from the Scheduling service.
        /// </summary>
        public ICollection<ChildActivityInterval> ActivityIntervals { get; set; } = [];

        /// <summary>
        /// Calculates the scheduling status based on activity intervals and today's date.
        /// </summary>
        public ChildSchedulingStatus GetSchedulingStatus(DateOnly today)
        {
            if (ActivityIntervals == null || ActivityIntervals.Count == 0)
                return ChildSchedulingStatus.NoPlanning;

            // Check for active interval (today falls within StartDate and EndDate)
            var hasActive = ActivityIntervals.Any(i =>
                i.StartDate <= today &&
                (!i.EndDate.HasValue || i.EndDate >= today));

            if (hasActive)
                return ChildSchedulingStatus.Active;

            // Check for upcoming interval (StartDate is in the future)
            var hasUpcoming = ActivityIntervals.Any(i => i.StartDate > today);

            if (hasUpcoming)
                return ChildSchedulingStatus.Upcoming;

            // All intervals are in the past
            return ChildSchedulingStatus.Past;
        }

        /// <summary>
        /// Gets the end date of the currently active interval, if any.
        /// Returns null if no active interval or if the active interval is open-ended.
        /// </summary>
        public DateOnly? GetActiveEndDate(DateOnly today)
        {
            return ActivityIntervals?
                .Where(i => i.StartDate <= today && (!i.EndDate.HasValue || i.EndDate >= today))
                .Select(i => i.EndDate)
                .FirstOrDefault();
        }

        /// <summary>
        /// Gets the start date of the next upcoming interval, if any.
        /// </summary>
        public DateOnly? GetNextUpcomingStartDate(DateOnly today)
        {
            return ActivityIntervals?
                .Where(i => i.StartDate > today)
                .OrderBy(i => i.StartDate)
                .Select(i => i.StartDate)
                .Cast<DateOnly?>()
                .FirstOrDefault();
        }
    }
}
