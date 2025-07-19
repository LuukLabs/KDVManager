using System;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.DataMigration.Services;

public class MigrationTenancyContext : ITenancyContext
{
    public Guid TenantId { get; } = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f"); // Default tenant for migration
}
