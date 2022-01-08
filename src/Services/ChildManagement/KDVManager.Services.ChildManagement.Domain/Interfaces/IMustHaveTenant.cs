using System;

namespace KDVManager.Services.ChildManagement.Domain.Interfaces
{
    public interface IMustHaveTenant
    {
        Guid TenantId { get; set; }
    }
}