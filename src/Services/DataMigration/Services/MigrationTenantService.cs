using System;
using KDVManager.Shared.Domain.Services;

namespace KDVManager.Services.DataMigration.Services;

public class MigrationTenantService : ITenantService
{
    public Guid CurrentTenant => Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f"); // Default tenant for migration

    public Guid? TryGetCurrentTenant() => CurrentTenant;

    public void ValidateTenant(Guid tenantId)
    {
        // Design-time factory - no validation needed
    }
}