using System;
using CrmTenantService = KDVManager.Services.CRM.Application.Contracts.Services.ITenantService;
using SchedulingTenantService = KDVManager.Services.Scheduling.Application.Contracts.Services.ITenantService;

namespace KDVManager.Services.DataMigration.Services;

public class MigrationTenantService : CrmTenantService
{
    public Guid Tenant { get; } = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f"); // Default tenant for migration
}

public class MigrationSchedulingTenantService : SchedulingTenantService
{
    public Guid Tenant { get; } = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f"); // Default tenant for migration
}
