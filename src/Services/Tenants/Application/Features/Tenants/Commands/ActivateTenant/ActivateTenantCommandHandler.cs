using System.Threading.Tasks;
using KDVManager.Services.Tenants.Application.Contracts.Persistence;
using KDVManager.Services.Tenants.Domain.Entities;
using KDVManager.Shared.Contracts.Events;
using MassTransit;

namespace KDVManager.Services.Tenants.Application.Features.Tenants.Commands.ActivateTenant;

public class ActivateTenantCommandHandler
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public ActivateTenantCommandHandler(ITenantRepository tenantRepository, IPublishEndpoint publishEndpoint)
    {
        _tenantRepository = tenantRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task Handle(ActivateTenantCommand request)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.Id);
        if (tenant == null)
        {
            throw new Exceptions.NotFoundException(nameof(Tenant), request.Id);
        }

        if (tenant.IsActive)
            return;

        tenant.IsActive = true;
        await _tenantRepository.UpdateAsync(tenant);

        await _publishEndpoint.Publish(new TenantStatusChangedEvent
        {
            TenantId = tenant.Id,
            IsActive = true
        });
    }
}
