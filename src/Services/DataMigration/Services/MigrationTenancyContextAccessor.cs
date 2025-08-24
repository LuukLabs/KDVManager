using System;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Infrastructure.Tenancy;

namespace KDVManager.Services.DataMigration.Services;

public class MigrationTenancyContextAccessor : TenancyContextAccessor
{
    public MigrationTenancyContextAccessor(Guid tenantId)
    {
        Current = new StaticTenancyContext(tenantId);
    }
}