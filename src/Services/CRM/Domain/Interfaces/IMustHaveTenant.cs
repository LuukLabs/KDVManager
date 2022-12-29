using System;

namespace KDVManager.Services.CRM.Domain.Interfaces
{
    public interface IMustHaveTenant
    {
        Guid TenantId { get; set; }
    }
}