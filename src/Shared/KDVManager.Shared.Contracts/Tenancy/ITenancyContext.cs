namespace KDVManager.Shared.Contracts.Tenancy;

public interface ITenancyContext
{
    Guid TenantId { get; }
}
