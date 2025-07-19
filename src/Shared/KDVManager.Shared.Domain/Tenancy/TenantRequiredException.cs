using System;

namespace KDVManager.Shared.Domain.Tenancy;

/// <summary>
/// Exception thrown when a tenant is required but not available
/// </summary>
public class TenantRequiredException : Exception
{
    public TenantRequiredException()
        : base("Tenant ID is required but not found in the current context")
    {
    }

    public TenantRequiredException(string message)
        : base(message)
    {
    }

    public TenantRequiredException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
