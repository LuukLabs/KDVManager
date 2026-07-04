namespace KDVManager.Shared.Contracts.Tenancy;

/// <summary>
/// Marks an entity as tenant-owned. TenantId is stamped on insert and guarded
/// against cross-tenant modification by the tenancy change tracker extensions.
/// </summary>
public interface IMustHaveTenant
{
    Guid TenantId { get; set; }
}
