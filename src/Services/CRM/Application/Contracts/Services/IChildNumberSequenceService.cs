using System;
using System.Threading.Tasks;

namespace KDVManager.Services.CRM.Application.Contracts.Services
{
    /// <summary>
    /// Service for managing child identification number sequences per tenant
    /// </summary>
    public interface IChildNumberSequenceService
    {
        /// <summary>
        /// Gets the next available child number for the current tenant.
        /// Handles concurrency to ensure unique sequential numbers.
        /// </summary>
        /// <returns>The next unique child number for the tenant</returns>
        Task<int> GetNextChildNumberAsync();

        /// <summary>
        /// Peeks at the next child number that would be assigned without consuming it.
        /// </summary>
        /// <returns>The next child number that would be assigned</returns>
        Task<int> PeekNextChildNumberAsync();
    }
}
