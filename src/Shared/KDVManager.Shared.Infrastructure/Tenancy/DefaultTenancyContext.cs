using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Shared.Infrastructure.Tenancy;

public class DefaultTenancyContext : ITenancyContext
{
    public Guid TenantId { get; }

    public DefaultTenancyContext(ITenancyResolver resolver)
    {
        TenantId = resolver.ResolveTenantId()
            ?? throw new InvalidOperationException("Tenant ID could not be resolved.");
    }
}