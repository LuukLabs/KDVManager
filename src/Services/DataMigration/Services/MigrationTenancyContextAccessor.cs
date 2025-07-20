using System;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Infrastructure.Tenancy;

namespace KDVManager.Services.DataMigration.Services;

public class MigrationTenancyContextAccessor : TenancyContextAccessor
{
    public MigrationTenancyContextAccessor()
    {
        // Initialize Current with MigrationTenancyContext only once
        Current = new StaticTenancyContext(Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f"));
    }
}