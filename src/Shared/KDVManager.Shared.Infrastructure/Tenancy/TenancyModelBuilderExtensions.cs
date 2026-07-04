using KDVManager.Shared.Contracts.Tenancy;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Shared.Infrastructure.Tenancy;

public static class TenancyModelBuilderExtensions
{
    /// <summary>
    /// Ensures every tenant-owned entity has an index leading with TenantId, matching the
    /// global query filters that scope all reads by tenant. Entities that already declare
    /// an index starting with TenantId (unique or composite) are left untouched.
    /// Call at the end of OnModelCreating, after entity configurations are applied.
    /// </summary>
    public static ModelBuilder ApplyTenantIndexes(this ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (!typeof(IMustHaveTenant).IsAssignableFrom(entityType.ClrType) || entityType.IsOwned())
            {
                continue;
            }

            var hasTenantLeadingIndex = entityType.GetIndexes()
                .Any(index => index.Properties[0].Name == nameof(IMustHaveTenant.TenantId));

            if (!hasTenantLeadingIndex)
            {
                modelBuilder.Entity(entityType.ClrType).HasIndex(nameof(IMustHaveTenant.TenantId));
            }
        }

        return modelBuilder;
    }
}
