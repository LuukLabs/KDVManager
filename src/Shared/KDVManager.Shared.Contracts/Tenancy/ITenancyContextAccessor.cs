namespace KDVManager.Shared.Contracts.Tenancy;

public interface ITenancyContextAccessor
{
    ITenancyContext? Current { get; set; }
}
