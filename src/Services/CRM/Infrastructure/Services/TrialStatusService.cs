using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Services.CRM.Infrastructure;
using KDVManager.Shared.Contracts.Events;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Contracts.Trial;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.CRM.Infrastructure.Services
{
    /// <summary>
    /// Source-of-truth trial status service. The first time a tenant is seen, a
    /// <see cref="Tenant"/> record is created (starting the 30-day trial) and a
    /// <see cref="TenantRegisteredEvent"/> is published so other services can sync.
    /// </summary>
    public class TrialStatusService : ITrialStatusService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITenancyContextAccessor _tenancyContextAccessor;
        private readonly IPublishEndpoint _publishEndpoint;

        public TrialStatusService(
            ApplicationDbContext context,
            ITenancyContextAccessor tenancyContextAccessor,
            IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _tenancyContextAccessor = tenancyContextAccessor;
            _publishEndpoint = publishEndpoint;
        }

        public async Task<TrialStatus> GetTrialStatusAsync(CancellationToken cancellationToken = default)
        {
            var tenantId = _tenancyContextAccessor.Current!.TenantId;

            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken);

            if (tenant is null)
            {
                var now = DateTime.UtcNow;
                tenant = new Tenant
                {
                    Id = tenantId,
                    TrialStartDate = now,
                    CreatedAt = now,
                };
                _context.Tenants.Add(tenant);

                try
                {
                    await _context.SaveChangesAsync(cancellationToken);

                    await _publishEndpoint.Publish(
                        new TenantRegisteredEvent { TrialStartDate = tenant.TrialStartDate },
                        cancellationToken);
                }
                catch (DbUpdateException)
                {
                    // Lost a race with a concurrent first request: reload the winner.
                    _context.Entry(tenant).State = EntityState.Detached;
                    tenant = await _context.Tenants
                        .FirstAsync(t => t.Id == tenantId, cancellationToken);
                }
            }

            return TrialStatus.FromStartDate(tenant.TrialStartDate);
        }
    }
}
