using System;
namespace KDVManager.Services.CRM.Application.Contracts.Services
{
    public interface ITenantService
    {
        Guid Tenant { get; }
    }
}
