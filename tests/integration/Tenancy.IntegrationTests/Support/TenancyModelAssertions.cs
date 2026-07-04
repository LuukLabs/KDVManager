using KDVManager.Shared.Contracts.Tenancy;
using Microsoft.EntityFrameworkCore.Metadata;
using Xunit;

namespace KDVManager.IntegrationTests.Tenancy.Support;

public static class TenancyModelAssertions
{
    /// <summary>
    /// Guards against a new entity being added without tenant scoping: every
    /// IMustHaveTenant entity in the model must have a global query filter and an
    /// index leading with TenantId.
    /// </summary>
    public static void AssertTenantOwnedEntitiesAreGuarded(IModel model)
    {
        var offenders = new List<string>();

        foreach (var entityType in model.GetEntityTypes())
        {
            if (!typeof(IMustHaveTenant).IsAssignableFrom(entityType.ClrType) || entityType.IsOwned())
            {
                continue;
            }

            if (entityType.GetDeclaredQueryFilters().Count == 0)
            {
                offenders.Add($"{entityType.DisplayName()} has no tenant query filter");
            }

            if (!entityType.GetIndexes().Any(index => index.Properties[0].Name == nameof(IMustHaveTenant.TenantId)))
            {
                offenders.Add($"{entityType.DisplayName()} has no TenantId-leading index");
            }
        }

        Assert.Empty(offenders);
    }
}
