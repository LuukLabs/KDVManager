using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Shared.Infrastructure.Tenancy;

public interface ITenancyResolver
{
    ITenancyContext? Resolve();
}
