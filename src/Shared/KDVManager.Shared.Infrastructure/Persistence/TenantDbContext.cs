using System.Reflection;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Infrastructure.Tenancy;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Shared.Infrastructure.Persistence;

/// <summary>
/// Base DbContext for tenant-scoped services: stamps and verifies TenantId on save and,
/// via <see cref="ApplyTenancy"/>, scopes every tenant-owned entity with a global query
/// filter and a TenantId-leading index.
/// </summary>
public abstract class TenantDbContext : DbContext
{
    private static readonly MethodInfo ApplyTenantQueryFilterMethod = typeof(TenantDbContext)
        .GetMethod(nameof(ApplyTenantQueryFilter), BindingFlags.Instance | BindingFlags.NonPublic)!;

    private readonly ITenancyContextAccessor _tenancyContextAccessor;

    protected TenantDbContext(DbContextOptions options, ITenancyContextAccessor tenancyContextAccessor) : base(options)
    {
        _tenancyContextAccessor = tenancyContextAccessor;
    }

    /// <summary>
    /// Applies a TenantId query filter to every non-owned IMustHaveTenant entity and
    /// ensures a TenantId-leading index. Call at the end of OnModelCreating, after all
    /// entities and configurations are registered.
    /// </summary>
    protected void ApplyTenancy(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (!typeof(IMustHaveTenant).IsAssignableFrom(entityType.ClrType) || entityType.IsOwned() || entityType.BaseType != null)
            {
                continue;
            }

            ApplyTenantQueryFilterMethod.MakeGenericMethod(entityType.ClrType).Invoke(this, new object[] { modelBuilder });
        }

        modelBuilder.ApplyTenantIndexes();
    }

    private void ApplyTenantQueryFilter<TEntity>(ModelBuilder modelBuilder) where TEntity : class, IMustHaveTenant
    {
        modelBuilder.Entity<TEntity>().HasQueryFilter(e => e.TenantId == _tenancyContextAccessor.Current!.TenantId);
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ChangeTracker.EnforceTenancy(_tenancyContextAccessor);
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        ChangeTracker.EnforceTenancy(_tenancyContextAccessor);
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }
}
