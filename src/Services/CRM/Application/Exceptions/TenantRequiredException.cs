using System;

namespace KDVManager.Services.CRM.Application.Exceptions;

public class TenantRequiredException : ApplicationException
{
    public TenantRequiredException() : base($"Tenant claim required.")
    {
    }
}
