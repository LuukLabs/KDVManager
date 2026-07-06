using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Shared.Infrastructure.Tenancy;

public class TenancyContextAccessor : ITenancyContextAccessor
{
    // AsyncLocal flows the tenant context with the ambient execution context, so a single
    // singleton instance serves HTTP requests and MassTransit consumers concurrently and
    // can be read by singleton OTel processors without capturing a request scope.
    private readonly AsyncLocal<ITenancyContext?> _current = new();

    public ITenancyContext? Current
    {
        get => _current.Value ?? throw new TenantRequiredException();
        set => _current.Value = value;
    }

    public bool HasTenant => _current.Value != null;
}
