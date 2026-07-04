namespace KDVManager.Shared.Infrastructure.Tenancy;

public class TenantRequiredException : Exception
{
    public TenantRequiredException() : base("Tenant context is required but not set.") { }

    public TenantRequiredException(string message) : base(message) { }
}
