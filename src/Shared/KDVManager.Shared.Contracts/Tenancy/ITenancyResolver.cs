namespace KDVManager.Shared.Contracts.Tenancy;

public interface ITenancyResolver
{
    Guid? ResolveTenantId();
}