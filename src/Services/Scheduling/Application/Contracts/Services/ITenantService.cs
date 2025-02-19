using System;
namespace KDVManager.Services.Scheduling.Application.Contracts.Services;

public interface ITenantService
{
    Guid Tenant { get; }
}
