namespace KDVManager.Shared.Infrastructure.Tenancy;

public class TenantMismatchException : Exception
{
    public TenantMismatchException(string entityType)
        : base($"Attempted to write an entity of type '{entityType}' that belongs to a different tenant.") { }
}
