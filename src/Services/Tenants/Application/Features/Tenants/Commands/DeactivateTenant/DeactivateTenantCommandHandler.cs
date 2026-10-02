using System.Threading.Tasks;
using KDVManager.Services.Tenants.Application.Contracts.Persistence;
using KDVManager.Services.Tenants.Domain.Entities;
using KDVManager.Shared.Contracts.Events;
using MassTransit;

namespace KDVManager.Services.Tenants.Application.Features.Tenants.Commands.DeactivateTenant;

public class DeactivateTenantCommandHandler
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public DeactivateTenantCommandHandler(ITenantRepository tenantRepository, IPublishEndpoint publishEndpoint)
    {
        _tenantRepository = tenantRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task Handle(DeactivateTenantCommand request)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.Id);
        if (tenant == null)
        {
            throw new Exceptions.NotFoundException(nameof(Tenant), request.Id);
        }

        if (!tenant.IsActive)
            return;

        tenant.IsActive = false;
        await _tenantRepository.UpdateAsync(tenant);

        await _publishEndpoint.Publish(new TenantStatusChangedEvent
        {
            TenantId = tenant.Id,
            IsActive = false
        });
    }
}
