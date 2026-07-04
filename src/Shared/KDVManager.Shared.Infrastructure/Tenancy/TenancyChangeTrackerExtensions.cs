using KDVManager.Shared.Contracts.Tenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace KDVManager.Shared.Infrastructure.Tenancy;

public static class TenancyChangeTrackerExtensions
{
    /// <summary>
    /// Stamps the current tenant on inserted entities and fails closed when a tracked
    /// entity that belongs to another tenant is about to be modified or deleted.
    /// Call from SaveChanges/SaveChangesAsync before persisting.
    /// </summary>
    public static void EnforceTenancy(this ChangeTracker changeTracker, ITenancyContextAccessor tenancyContextAccessor)
    {
        foreach (var entry in changeTracker.Entries<IMustHaveTenant>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.TenantId = tenancyContextAccessor.Current!.TenantId;
                    break;
                case EntityState.Modified:
                case EntityState.Deleted:
                    if (entry.Entity.TenantId != tenancyContextAccessor.Current!.TenantId)
                    {
                        throw new TenantMismatchException(entry.Metadata.ClrType.Name);
                    }
                    break;
            }
        }
    }
}
