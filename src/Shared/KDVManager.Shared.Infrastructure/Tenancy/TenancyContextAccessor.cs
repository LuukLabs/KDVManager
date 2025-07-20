using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Shared.Infrastructure.Tenancy;

public class TenancyContextAccessor : ITenancyContextAccessor
{
    private ITenancyContext? _current;
    public ITenancyContext? Current
    {
        get => _current ?? throw new TenantRequiredException();
        set => _current = value;
    }
}
