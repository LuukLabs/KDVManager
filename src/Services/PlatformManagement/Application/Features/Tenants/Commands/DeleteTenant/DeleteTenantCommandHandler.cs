using System.Threading.Tasks;
using KDVManager.Services.PlatformManagement.Application.Contracts.Persistence;
using KDVManager.Services.PlatformManagement.Application.Exceptions;
using KDVManager.Services.PlatformManagement.Domain.Entities;
using KDVManager.Shared.Contracts.Events;
using MassTransit;

namespace KDVManager.Services.PlatformManagement.Application.Features.Tenants.Commands.DeleteTenant;

public class DeleteTenantCommandHandler
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public DeleteTenantCommandHandler(ITenantRepository tenantRepository, IPublishEndpoint publishEndpoint)
    {
        _tenantRepository = tenantRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task Handle(DeleteTenantCommand request)
    {
        var tenantToDelete = await _tenantRepository.GetByIdAsync(request.Id);

        if (tenantToDelete == null)
        {
            throw new NotFoundException(nameof(Tenant), request.Id);
        }

        await _tenantRepository.DeleteAsync(tenantToDelete);

        // Publish event
        await _publishEndpoint.Publish(new TenantDeletedEvent
        {
            TenantId = tenantToDelete.Id
        });
    }
}
