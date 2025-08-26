using System;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Services;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Services.CRM.Infrastructure;
using KDVManager.Shared.Contracts.Tenancy;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.CRM.Infrastructure.Services
{
    /// <summary>
    /// Service for managing child identification number sequences per tenant
    /// </summary>
    public class ChildNumberSequenceService : IChildNumberSequenceService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITenancyContextAccessor _tenancyContextAccessor;

        public ChildNumberSequenceService(ApplicationDbContext context, ITenancyContextAccessor tenancyContextAccessor)
        {
            _context = context;
            _tenancyContextAccessor = tenancyContextAccessor;
        }

        /// <summary>
        /// Gets the next available child number for the current tenant.
        /// Uses database transactions to handle concurrency and ensure unique sequential numbers.
        /// </summary>
        /// <returns>The next unique child number for the tenant</returns>
        public async Task<int> GetNextChildNumberAsync()
        {
            var tenantId = _tenancyContextAccessor.Current!.TenantId;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Find or create the sequence for this tenant
                var sequence = await _context.ChildNumberSequences
                    .FirstOrDefaultAsync(s => s.TenantId == tenantId);

                if (sequence == null)
                {
                    // Create new sequence starting at 1
                    sequence = new ChildNumberSequence
                    {
                        TenantId = tenantId,
                        NextChildNumber = 1
                    };
                    _context.ChildNumberSequences.Add(sequence);
                }

                // Get the next child number and increment the sequence
                var childNumber = sequence.GetNextChildNumber();

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return childNumber;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
