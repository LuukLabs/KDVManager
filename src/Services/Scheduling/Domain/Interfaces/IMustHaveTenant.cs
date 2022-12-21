using System;

namespace KDVManager.Services.Scheduling.Domain.Interfaces;

public interface IMustHaveTenant
{
    Guid TenantId { get; set; }
}
