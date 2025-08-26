using System;
using KDVManager.Services.CRM.Domain.Interfaces;

namespace KDVManager.Services.CRM.Domain.Entities
{
    /// <summary>
    /// Entity to track the next available child identification number per tenant.
    /// Ensures unique, incremental child numbers within each tenant.
    /// </summary>
    public class ChildNumberSequence : IMustHaveTenant
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }

        /// <summary>
        /// The next child number to be assigned for this tenant.
        /// This value is incremented each time a new child is created.
        /// </summary>
        public int NextChildNumber { get; set; }

        /// <summary>
        /// Initialize with the first child number starting at 1
        /// </summary>
        public ChildNumberSequence()
        {
            Id = Guid.NewGuid();
            NextChildNumber = 1;
        }

        /// <summary>
        /// Get the next available child number and increment the sequence.
        /// </summary>
        /// <returns>The child number to assign to the new child</returns>
        public int GetNextChildNumber()
        {
            var childNumber = NextChildNumber;
            NextChildNumber++;
            return childNumber;
        }
    }
}
