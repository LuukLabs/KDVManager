using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Shared.Infrastructure.Tenancy;

public class StaticTenancyContext : ITenancyContext
{
    public Guid TenantId { get; }
    public StaticTenancyContext(Guid tenantId) => TenantId = tenantId;
}

