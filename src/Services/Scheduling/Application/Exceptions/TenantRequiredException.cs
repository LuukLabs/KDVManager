using System;

namespace KDVManager.Services.Scheduling.Application.Exceptions;

public class TenantRequiredException : ApplicationException
{
    public TenantRequiredException() : base($"Tenant claim required.")
    {
    }
}
